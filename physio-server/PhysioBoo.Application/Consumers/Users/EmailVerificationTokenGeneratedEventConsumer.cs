using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class EmailVerificationTokenGeneratedEventConsumer : IConsumer<EmailVerificationTokenGeneratedEvent>
    {
        private readonly ILogger<EmailVerificationTokenGeneratedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;
        private readonly IEmailSender _emailSender;
        private readonly ServerSettings _server;

        public EmailVerificationTokenGeneratedEventConsumer(
            ILogger<EmailVerificationTokenGeneratedEventConsumer> logger,
            IMediatorHandler bus,
            IOptions<ServerSettings> options,
            IEmailSender emailSender
        )
        {
            _logger = logger;
            _bus = bus;
            _emailSender = emailSender;
            _server = options.Value;
        }

        public async Task Consume(ConsumeContext<EmailVerificationTokenGeneratedEvent> context)
        {
            _logger.LogInformation(
                "EmailVerificationTokenGeneratedEventConsumer handled for User {UserId}, CorrelationId {CorrelationId}",
                context.Message.UserId, context.CorrelationId
            );

            string userName = string.Empty, subject = string.Empty, email = string.Empty, verificationUrl = string.Empty;
            object model = new { };

            if (context.Message.UserId.HasValue)
            {
                var user = await _bus.QueryAsync(new GetUserByIdQuery(context.Message.UserId.Value));

                if (user != null)
                {
                    email = user.Email;
                    userName = user.Email.Split('@')[0];
                    subject = "Verify Your Email Address - Action Required";
                    verificationUrl = $"{_server.BaseUrl}/api/users/verify-email?type={VerificationType.Email.ToString()}token={context.Message.Token}";
                    model = new { UserName = userName, VerificationUrl = verificationUrl };
                }
            }
            else if (!string.IsNullOrEmpty(context.Message.Email))
            {
                email = context.Message.Email;
                userName = context.Message.Email.Split('@')[0];
                subject = "Forgot password";
                verificationUrl = $"{_server.BaseUrl}/api/users/verify-email?type={VerificationType.PasswordReset.ToString()}token={context.Message.Token}";
                model = new { UserName = userName, ResetLink = verificationUrl, Year = TimeZoneHelper.GetLocalTimeNow().Year };
            }
            else
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    typeof(EmailVerificationTokenGeneratedEventConsumer).Name,
                    $"Cannot send mail because email or user id do not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            await _emailSender.SendTemplateAsync(
                email,
                context.Message.Type,
                model,
                subject
            );
        }
    }
}
