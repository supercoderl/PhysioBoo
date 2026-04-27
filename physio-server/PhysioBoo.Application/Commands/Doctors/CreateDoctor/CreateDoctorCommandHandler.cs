using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Doctors;
using PhysioBoo.SharedKernel.Results;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorCommand>
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public CreateDoctorCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorRepository doctorRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorRepository = doctorRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newEmployeeId = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(Doctor), cancellationToken);

            User newUser = new User(
                request.NewId,
                request.NewDoctor.Email,
                request.NewDoctor.Phone,
                AuthHelper.HashPassword(request.NewDoctor.Password)
            );

            newUser.SetCreatedBy(_user.GetUserId());

            Profile newProfile = new Profile(
                request.NewId,
                request.NewDoctor.FirstName,
                request.NewDoctor.LastName,
                request.NewDoctor.MiddleName,
                request.NewDoctor.DateOfBirth,
                request.NewDoctor.Gender,
                request.NewDoctor.BloodGroup,
                request.NewDoctor.MaritalStatus,
                request.NewDoctor.Nationality,
                request.NewDoctor.IdentificationType,
                request.NewDoctor.IdentificationNumber,
                request.NewDoctor.IdentificationExpiry,
                request.NewDoctor.EmergencyContactName,
                request.NewDoctor.EmergencyContactPhone,
                request.NewDoctor.EmergencyContactRelationship,
                request.NewDoctor.PreferredCommunication
            );

            Doctor newDoctor = new Doctor(
                request.NewId,
                newEmployeeId,
                request.NewDoctor.MedicalLicenseNumber,
                request.NewDoctor.MedicalLicenseExpiry,
                request.NewDoctor.MedicalLicenseIssuingAuthority,
                request.NewDoctor.PrimarySpecialtyId,
                request.NewDoctor.Bio,
                request.NewDoctor.About,
                request.NewDoctor.Archivements,
                request.NewDoctor.ResearchInterests,
                request.NewDoctor.BankAccountDetails,
                request.NewDoctor.PanNumber,
                request.NewDoctor.Gstin
            );

            newDoctor.SetLanguagesSpoken(request.NewDoctor.LanguagesSpoken);
            newDoctor.SetEmploymentStatus(request.NewDoctor.EmploymentStatus);
            newDoctor.SetYearsOfExperience(request.NewDoctor.YearsOfExperience);
            newDoctor.SetYearsOfPractice(request.NewDoctor.YearsOfPractice);
            newDoctor.SetPublicationsCount(request.NewDoctor.PublicationsCount);
            newDoctor.SetConferencePresentations(request.NewDoctor.ConferencePresentations);

            DbResult<Guid> result = await _doctorRepository.RegisterDoctor(newUser, newProfile, newDoctor, cancellationToken);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new DoctorCreatedEvent(result.Id));
        }
    }
}
