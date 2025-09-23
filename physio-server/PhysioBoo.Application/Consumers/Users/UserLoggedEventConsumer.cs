using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken;
using PhysioBoo.Application.ViewModels.RefreshTokens;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserLoggedEventConsumer : IConsumer<UserLoggedEvent>
    {
        private readonly ILogger<UserLoggedEvent> _logger;
        private readonly IMediatorHandler _bus;
        private readonly TokenSettings _token;

        public UserLoggedEventConsumer(
            ILogger<UserLoggedEvent> logger,
            IMediatorHandler bus,
            IOptions<TokenSettings> options
        )
        {
            _logger = logger;
            _bus = bus;
            _token = options.Value;
        }

        public async Task Consume(ConsumeContext<UserLoggedEvent> context)
        {
            _logger.LogInformation(
                   "UserLoggedEventConsumer handled for Token {RefreshToken}, CorrelationId {CorrelationId}",
                   context.Message.RefreshToken, context.CorrelationId
            );

            await _bus.SendCommandAsync(new CreateRefreshTokenCommand(new CreateRefreshTokenViewModel(
                Guid.NewGuid(),
                context.Message.AggregateId,
                context.Message.RefreshToken,
                TimeZoneHelper.GetLocalTimeNow().AddDays(_token.ExpiryDurationMinutes >= 15 ? _token.ExpiryDurationMinutes : 15)
            )));
        }
    }
}
