using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Patients;

namespace PhysioBoo.Application.Commands.Patients.CreatePatient
{
    public sealed class CreatePatientCommandHandler : CommandHandlerBase, IRequestHandler<CreatePatientCommand>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly Random _random = new();

        public CreatePatientCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientRepository patientRepository,
            IUser user,
            ISys_SequenceTrackerRepository sequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _patientRepository = patientRepository;
            _user = user;
            _sequenceTrackerRepository = sequenceTrackerRepository;
        }

        public async Task Handle(CreatePatientCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sequenceTrackerRepository.GenerateNextCodeAsync("Patient", ct);

            Profile newProfile = new Profile(
                Guid.NewGuid(),
                request.NewPatient.Profile.FirstName,
                request.NewPatient.Profile.LastName,
                string.Empty,
                DateOnly.Parse(request.NewPatient.Profile.DateOfBirth.ToString()),
                request.NewPatient.Profile.Gender,
                request.NewPatient.Profile.BloodGroup,
                request.NewPatient.Profile.MaritalStatus,
                null,
                request.NewPatient.Profile.Email,
                request.NewPatient.Profile.Phone,
                null, null, null,
                request.NewPatient.Profile.EmergencyContactName,
                request.NewPatient.Profile.EmergencyContactPhone,
                null,
                PreferredCommunication.Email
            );
            newProfile.SetCreatedBy(_user.GetUserId());
            newProfile.SetTenantId(_user.GetTenantId());

            Patient newPatient = new Patient(
                request.NewId,
                newCode,
                request.NewPatient.UserId,
                newProfile.Id,
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
            );

            newPatient.SetTenantId(_user.GetTenantId());
            newPatient.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _patientRepository.InsertPatientFullInfo(newProfile, newPatient, ct);

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
    }
}
