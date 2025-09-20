using MassTransit;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserResetPasswordEventConsumer : IConsumer<UserResetPasswordEvent>
    {
        private readonly IEmailSender _emailSender;

        public UserResetPasswordEventConsumer(
            IEmailSender emailSender
        )
        {
            _emailSender = emailSender;
        }

        public async Task Consume(ConsumeContext<UserResetPasswordEvent> context)
        {
            await _emailSender.SendTemplateAsync(
                context.Message.Email,
                "PasswordResetSuccess",
                new
                {
                    userName = context.Message.Email.Split("@")[0],
                    timestamp = TimeZoneHelper.GetLocalTimeNow().ToString("yyyy-MM-dd HH:mm:ss"),
                    year = TimeZoneHelper.GetLocalTimeNow().Year
                },
                "You have reset your password"
            );
        }
    }
}
