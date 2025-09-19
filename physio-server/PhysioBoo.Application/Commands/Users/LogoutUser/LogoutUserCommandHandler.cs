using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.Commands.Users.LogoutUser
{
    public sealed class LogoutUserCommandHandler : CommandHandlerBase, IRequestHandler<LogoutUserCommand>
    {
        public LogoutUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications
        ) : base(bus, unitOfWork, notifications)
        {

        }

        public async Task Handle(LogoutUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            // Logic command

            await Bus.RaiseEventAsync(new UserLoggedOutEvent());
        }
    }
}
