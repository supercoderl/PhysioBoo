using MassTransit;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserResetPasswordEventConsumer : IConsumer<UserResetPasswordEvent>
    {
        private readonly IEmailSender _emailSender;
        private readonly IVerificationTokenRepository _verificationTokenRepository;
        private readonly IUserRepository _userRepository;

        public UserResetPasswordEventConsumer(
            IEmailSender emailSender,
            IVerificationTokenRepository verificationTokenRepository,
            IUserRepository userRepository
        )
        {
            _emailSender = emailSender;
            _verificationTokenRepository = verificationTokenRepository;
            _userRepository = userRepository;
        }

        public async Task Consume(ConsumeContext<UserResetPasswordEvent> context)
        {
            Domain.Entities.Core.User? user = await _userRepository.GetByIdAsync(context.Message.UserId);
            if (user != null)
            {
                Task[] tasks = new[]
                {
                    _emailSender.SendTemplateAsync(
                        user.Email,
                        "PasswordResetSuccess",
                        new
                        {
                            userName = user.Email.Split("@")[0],
                            timestamp = TimeZoneHelper.GetLocalTimeNow().ToString("yyyy-MM-dd HH:mm:ss"),
                            year = TimeZoneHelper.GetLocalTimeNow().Year
                        },
                        "You have reset your password"
                    ),
                    _verificationTokenRepository.BatchUpdateAsync(
                        predicate: vt => vt.Token == context.Message.Token && !vt.IsUsed && vt.ExpiresAt > TimeZoneHelper.GetLocalTimeNow(),
                        updateDto: new { IsUsed = true }
                    )
                };

                await Task.WhenAll(tasks);
            }
        }
    }
}
