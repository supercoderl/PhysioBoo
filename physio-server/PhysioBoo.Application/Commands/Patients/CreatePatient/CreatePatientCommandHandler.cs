using MediatR;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Patients;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Patients.CreatePatient
{
    public sealed class CreatePatientCommandHandler : CommandHandlerBase, IRequestHandler<CreatePatientCommand>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly Random _random = new();

        public CreatePatientCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientRepository patientRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _patientRepository = patientRepository;
        }

        public async Task Handle(CreatePatientCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _patientRepository.InsertAsync<Patient, Guid>(new Patient(
                request.Id,
                Generate(),
                request.NewPatient.PrimaryDoctorId,
                request.NewPatient.ReferredBy,
                request.NewPatient.ReferralHospitalId,
                request.NewPatient.InssuranceProvider,
                request.NewPatient.InssurancePolicyNumber,
                request.NewPatient.InssuranceExpiryDate,
                request.NewPatient.InssuranceCoverageAmount,
                request.NewPatient.MedicalHistory,
                request.NewPatient.FamilyHistory,
                request.NewPatient.SurgicalHistory,
                request.NewPatient.AllergyInformation,
                request.NewPatient.CurrentMedications,
                request.NewPatient.LifestyleNotes,
                request.NewPatient.Occupation,
                request.NewPatient.AnnualIncomeRange,
                request.NewPatient.PreferredHospitalId,
                request.NewPatient.PreferredDoctorId,
                request.NewPatient.PreferredAppointmentTime,
                request.NewPatient.CommunicationPreferences,
                null,
                null
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

            await Bus.RaiseEventAsync(new PatientCreatedEvent(result.Id));
        }

        private string Generate()
        {
            var timestamp = TimeZoneHelper.GetLocalTimeNow().ToString("yyyyMMddHHmmss");
            var randomSuffix = _random.Next(100, 999);
            return $"PAT-{timestamp}-{randomSuffix}";
        }
    }
}
