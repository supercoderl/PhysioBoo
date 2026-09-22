using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Tenants;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Invites
{
    public sealed class TenantInviteCreatedEventConsumer : IConsumer<TenantInviteCreatedEvent>
    {
        private readonly ILogger<TenantInviteCreatedEventConsumer> _logger;
        private readonly IEmailSender _emailSender;
        private readonly ServerSettings _server;

        public TenantInviteCreatedEventConsumer(
            ILogger<TenantInviteCreatedEventConsumer> logger,
            IOptions<ServerSettings> options,
            IEmailSender emailSender
        )
        {
            _logger = logger;
            _emailSender = emailSender;
            _server = options.Value;
        }

        public async Task Consume(ConsumeContext<TenantInviteCreatedEvent> context)
        {
            _logger.LogInformation(
                "TenantInviteCreatedEventConsumer handled for Invite {InviteId}, CorrelationId {CorrelationId}",
                context.Message.AggregateId, context.CorrelationId
            );

            if (string.IsNullOrEmpty(context.Message.Email))
            {
                _logger.LogInformation("Invite {InviteId} has no email attached — open link, nothing to send", context.Message.AggregateId);
                return;
            }

            string redeemUrl = $"{_server.BaseUrl}/auth/register-with-invite?token={context.Message.Token}";

            await _emailSender.SendTemplateAsync(
                context.Message.Email,
                "TenantInvite",
                new
                {
                    RedeemUrl = redeemUrl,
                    ExpiresAt = context.Message.ExpiresAt,
                    Year = TimeZoneHelper.GetLocalTimeNow().Year
                },
                "You've been invited to join Physio Boo"
            );
        }
    }
}
