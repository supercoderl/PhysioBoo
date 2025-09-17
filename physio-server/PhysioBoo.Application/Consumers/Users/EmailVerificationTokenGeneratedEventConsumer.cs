using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Commands.Mails.SendMail;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class EmailVerificationTokenGeneratedEventConsumer : IConsumer<EmailVerificationTokenGeneratedEvent>
    {
        private readonly ILogger<EmailVerificationTokenGeneratedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;
        private readonly ServerSettings _server;

        public EmailVerificationTokenGeneratedEventConsumer(
            ILogger<EmailVerificationTokenGeneratedEventConsumer> logger,
            IMediatorHandler bus,
            IOptions<ServerSettings> options
        )
        {
            _logger = logger;
            _bus = bus;
            _server = options.Value;
        }

        public async Task Consume(ConsumeContext<EmailVerificationTokenGeneratedEvent> context)
        {
            _logger.LogInformation(
                "EmailVerificationTokenGeneratedEventConsumer handled for User {UserId}, CorrelationId {CorrelationId}",
                context.Message.UserId, context.CorrelationId
            );

            var user = await _bus.QueryAsync(new GetUserByIdQuery(context.Message.UserId));

            if (user != null)
            {
                var verificationUrl = $"{_server.BaseUrl}/api/users/verify-email?token={context.Message.Token}";

                var subject = "Verify Your Email Address - Action Required";

                var userName = user.Email.Split('@')[0];

                var htmlContent = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset='utf-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        <title>Email Verification</title>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                            .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                            .button {{ display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                            .button:hover {{ background-color: #45a049; }}
                            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
                            .warning {{ background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }}
                        </style>
                    </head>
                    <body>
                        <div class='header'>
                            <h1>Welcome to PhysioBoo!</h1>
                        </div>
    
                        <div class='content'>
                            <h2>Hello {userName},</h2>
        
                            <p>Thank you for signing up with PhysioBoo! To complete your registration and secure your account, please verify your email address by clicking the button below.</p>
        
                            <div style='text-align: center;'>
                                <a href='{verificationUrl}' class='button'>Verify My Email Address</a>
                            </div>
        
                            <div class='warning'>
                                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. Please verify your email as soon as possible.
                            </div>
        
                            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                            <p style='word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;'>
                                <a href='{verificationUrl}'>{verificationUrl}</a>
                            </p>
        
                            <p>If you didn't create an account with PhysioBoo, please ignore this email or contact our support team.</p>
        
                            <p>Best regards,<br>The PhysioBoo Team</p>
                        </div>
    
                        <div class='footer'>
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>© 2025 PhysioBoo. All rights reserved.</p>
                        </div>
                    </body>
                    </html>
                ";

                await _bus.SendCommandAsync(new SendMailCommand(
                    user.Email,
                    subject,
                    htmlContent,
                    true
                ));
            }
        }
    }
}
