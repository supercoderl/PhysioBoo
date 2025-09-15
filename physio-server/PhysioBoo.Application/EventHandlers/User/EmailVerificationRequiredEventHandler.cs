using MediatR;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.EventHandlers.User
{
    public sealed class EmailVerificationRequiredEventHandler : INotificationHandler<EmailVerificationRequiredEvent>
    {
        private readonly IMediatorHandler _bus;

        public EmailVerificationRequiredEventHandler(IMediatorHandler bus)
        {
            _bus = bus;
        }

        public async Task Handle(EmailVerificationRequiredEvent notification, CancellationToken cancellationToken)
        {
            await _bus.SendCommandAsync(new GenerateEmailVerificationTokenCommand(
                new List<ViewModels.Users.VerificationTokenViewModel>
                {
                    new ViewModels.Users.VerificationTokenViewModel(
                        Guid.NewGuid(),
                        notification.UserId,
                        notification.Token,
                        notification.ExpiresAt,
                        Domain.Enums.VerificationType.Email
                    )
                }
            ));
        }
    }
}
