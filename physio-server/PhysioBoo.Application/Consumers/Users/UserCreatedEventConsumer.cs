using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKenel.Utils;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserCreatedEventConsumer : IConsumer<UsersCreatedEvent>
    {
        private readonly ILogger<UserCreatedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;

        public UserCreatedEventConsumer(ILogger<UserCreatedEventConsumer> logger, IMediatorHandler bus)
        {
            _logger = logger;
            _bus = bus;
        }

        public async Task Consume(ConsumeContext<UsersCreatedEvent> context)
        {
            foreach (var userId in context.Message.UserIds)
            {
                _logger.LogInformation(
                    "UserCreatedEventConsumer handled for User {UserId}, CorrelationId {CorrelationId}",
                    userId, context.CorrelationId
                );

                await _bus.SendCommandAsync(new GenerateEmailVerificationTokenCommand(
                    new List<ViewModels.Users.VerificationTokenViewModel>
                    {
                        new ViewModels.Users.VerificationTokenViewModel(
                            Guid.NewGuid(),
                            userId,
                            TokenHelper.GenerateTimestampedToken(24),
                            TimeZoneHelper.GetLocalTimeNow().AddHours(24),
                            Domain.Enums.VerificationType.Email
                        )
                    }
                ));
            }
        }
    }
}
