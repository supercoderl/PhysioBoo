using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Users.UpdateUser;
using PhysioBoo.Application.Queries.VerificationTokens.GetByToken;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserVerifiedEventConsumer : IConsumer<UserVerifiedEvent>
    {
        private readonly ILogger<UserVerifiedEvent> _logger;
        private readonly IMediatorHandler _bus;
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public UserVerifiedEventConsumer(
            ILogger<UserVerifiedEvent> logger,
            IMediatorHandler bus,
            IVerificationTokenRepository verificationTokenRepository
        )
        {
            _logger = logger;
            _bus = bus;
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task Consume(ConsumeContext<UserVerifiedEvent> context)
        {
            var token = await _bus.QueryAsync(new GetVerificationTokenByTokenQuery(context.Message.Token));

            if (token != null)
            {
                _logger.LogInformation(
                    "UserCreatedEventConsumer handled for User {UserId}, CorrelationId {CorrelationId}",
                    token.UserId, context.CorrelationId
                );

                await _bus.SendCommandAsync(new UpdateUserCommand(token.UserId, new { IsVerified = true, EmailVerifiedAt = (DateTime?)TimeZoneHelper.GetLocalTimeNow() }));
            }
        }
    }
}
