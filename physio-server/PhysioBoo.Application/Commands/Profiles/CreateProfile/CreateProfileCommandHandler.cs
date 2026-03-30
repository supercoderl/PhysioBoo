using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Profiles.CreateProfile
{
    public sealed class CreateProfileCommandHandler : CommandHandlerBase, IRequestHandler<CreateProfileCommand>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IUser _user;

        public CreateProfileCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IProfileRepository profileRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _profileRepository = profileRepository;
            _user = user;
        }

        public async Task Handle(CreateProfileCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Profile newProfile = new Profile(
                _user.GetUserId(),
                request.NewProfile.FirstName,
                request.NewProfile.LastName,
                request.NewProfile.MiddleName,
                request.NewProfile.DateOfBirth,
                request.NewProfile.Gender,
                request.NewProfile.BloodGroup,
                request.NewProfile.MaritalStatus,
                request.NewProfile.Nationality,
                request.NewProfile.IdentificationType,
                request.NewProfile.IdentificationNumber,
                request.NewProfile.IdentificationExpiry,
                request.NewProfile.EmergencyContactName,
                request.NewProfile.EmergencyContactPhone,
                request.NewProfile.EmergencyContactRelationship,
                request.NewProfile.PreferredCommunication
            );

            newProfile.SetTenantId(_user.GetTenantId());
            newProfile.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _profileRepository.InsertAsync<Profile, Guid>(newProfile);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try gain. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
