using MediatR;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory
{
    public sealed class CreatePatientMedicalHistoryCommandHandler : CommandHandlerBase, IRequestHandler<CreatePatientMedicalHistoryCommand>
    {
        private readonly IPatientMedicalHistoryRepository _patientMedicalHistoryRepository;
        private readonly IUser _user;

        public CreatePatientMedicalHistoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientMedicalHistoryRepository patientMedicalHistoryRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _patientMedicalHistoryRepository = patientMedicalHistoryRepository;
            _user = user;
        }

        public async Task Handle(CreatePatientMedicalHistoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            PatientMedicalHistory newPatientMedicalHistory = new PatientMedicalHistory(
                request.NewPatientMedicalHistory.Id,
                request.NewPatientMedicalHistory.PatientId,
                request.NewPatientMedicalHistory.ConditionName,
                request.NewPatientMedicalHistory.ConditionCategory,
                request.NewPatientMedicalHistory.Icd10Code,
                request.NewPatientMedicalHistory.DiagnosedDate,
                request.NewPatientMedicalHistory.DiagnosedBy,
                request.NewPatientMedicalHistory.DiagnosisHospitalId,
                request.NewPatientMedicalHistory.Severity,
                request.NewPatientMedicalHistory.CurrentStatus,
                request.NewPatientMedicalHistory.TreatmentSummary,
                request.NewPatientMedicalHistory.MedicationsPrescribed,
                request.NewPatientMedicalHistory.NextReviewDate,
                request.NewPatientMedicalHistory.Notes
            );

            newPatientMedicalHistory.SetTenantId(_user.GetTenantId());
            newPatientMedicalHistory.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _patientMedicalHistoryRepository.InsertAsync<PatientMedicalHistory, Guid>(newPatientMedicalHistory);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
