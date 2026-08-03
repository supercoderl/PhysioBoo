using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;
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
            _logger.LogInformation(
                    "UserCreatedEventConsumer handled for User {UserId}, CorrelationId {CorrelationId}",
                    context.Message.AggregateId, context.CorrelationId
                );

            await _bus.SendCommandAsync(new GenerateEmailVerificationTokenCommand(
                new CreateVerificationTokenViewModel(
                    Guid.NewGuid(),
                    context.Message.AggregateId,
                    TokenHelper.GenerateTimestampedToken(24),
                    TimeZoneHelper.GetLocalTimeNow().AddMinutes(15),
                    Enum.Parse<VerificationType>(context.Message.Type)
                )
            ));

            // Patient creation is no longer implied by self-registration: a User here
            // only has an email/phone/password, not the demographic data a Patient
            // requires. The frontend collects that separately via a "complete your
            // profile" step (CreatePatientCommand with UserId set), after signup.
        }
    }
}
