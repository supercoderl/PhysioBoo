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

        public CreateProfileCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IProfileRepository profileRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _profileRepository = profileRepository;
        }

        public async Task Handle(CreateProfileCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _profileRepository.InsertAsync<Profile, Guid>(new Profile(
                request.UserId,
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
            ));

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
