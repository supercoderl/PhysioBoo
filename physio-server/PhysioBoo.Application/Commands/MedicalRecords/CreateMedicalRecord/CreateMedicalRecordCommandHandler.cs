using MediatR;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord
{
    public sealed class CreateMedicalRecordCommandHandler : CommandHandlerBase, IRequestHandler<CreateMedicalRecordCommand>
    {
        private readonly IMedicalRecordRepository _medicalRecordRepository;

        public CreateMedicalRecordCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalRecordRepository medicalRecordRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalRecordRepository = medicalRecordRepository;
        }

        public async Task Handle(CreateMedicalRecordCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _medicalRecordRepository.InsertAsync<MedicalRecord, Guid>(new MedicalRecord(
                request.NewMedicalRecord.Id,
                request.NewMedicalRecord.RecordNumber,
                request.NewMedicalRecord.PatientId,
                request.NewMedicalRecord.AppointmentId,
                request.NewMedicalRecord.DoctorId,
                request.NewMedicalRecord.HospitalId,
                request.NewMedicalRecord.RecordType,
                request.NewMedicalRecord.ChiefComplaint,
                request.NewMedicalRecord.HistoryOfPresentIllness,
                request.NewMedicalRecord.PastMedicalHistory,
                request.NewMedicalRecord.FamilyHistory,
                request.NewMedicalRecord.SocialHistory,
                request.NewMedicalRecord.ReviewOfSystems,
                request.NewMedicalRecord.PhysicalExamination,
                request.NewMedicalRecord.VitalSigns,
                request.NewMedicalRecord.ClinicalFindings,
                request.NewMedicalRecord.ProvisionalDiagnosis,
                request.NewMedicalRecord.FinalDiagnosis,
                request.NewMedicalRecord.Icd10Codes,
                request.NewMedicalRecord.DifferencentialDiagnosis,
                request.NewMedicalRecord.TreatmentPlan,
                request.NewMedicalRecord.MedicationsPrescribed,
                request.NewMedicalRecord.ProceduresPerformed,
                request.NewMedicalRecord.InvestigationsOrdered,
                request.NewMedicalRecord.FollowUpInstructions,
                request.NewMedicalRecord.Prognosis,
                request.NewMedicalRecord.DoctorNotes,
                request.NewMedicalRecord.PatientEducationProvided,
                request.NewMedicalRecord.DischargeSummary,
                request.UserId
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
