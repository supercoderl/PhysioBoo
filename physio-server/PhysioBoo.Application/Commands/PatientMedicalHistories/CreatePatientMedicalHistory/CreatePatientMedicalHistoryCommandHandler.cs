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

        public CreatePatientMedicalHistoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientMedicalHistoryRepository patientMedicalHistoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _patientMedicalHistoryRepository = patientMedicalHistoryRepository;
        }

        public async Task Handle(CreatePatientMedicalHistoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _patientMedicalHistoryRepository.InsertAsync<PatientMedicalHistory, Guid>(new PatientMedicalHistory(
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
            ));

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
