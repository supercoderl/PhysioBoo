using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.Commands.Users.UpdateUser
{
    public sealed class UpdateUserCommandHandler : CommandHandlerBase, IRequestHandler<UpdateUserCommand>
    {
        private readonly IUserRepository _userRepository;

        public UpdateUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
        }

        public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.User? user = await _userRepository.GetByIdAsync(request.Id);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            user.SetEmail(request.UpdateUserData.Email);
            user.SetPhone(request.UpdateUserData.Phone);
            user.SetAlternatePhone(request.UpdateUserData.AlternatePhone);
            user.SetIsActive(request.UpdateUserData.IsActive);
            if (!string.IsNullOrEmpty(request.UpdateUserData.TwoFactorSecret))
            {
                user.SetTwoFactorSecret(request.UpdateUserData.TwoFactorSecret);
                user.SetTwoFactorEnabled(true);
            }
            user.SetProfilePicture(request.UpdateUserData.ProfilePicture);
            user.SetPreferredLanguage(request.UpdateUserData.PreferredLanguage);
            user.SetTimeZone(request.UpdateUserData.TimeZone);

            int resultCount = await _userRepository.UpdateTrackedAsync(user, cancellationToken);

            if (resultCount > 0) await Bus.RaiseEventAsync(new UserUpdatedEvent(request.Id));
        }
    }
}
