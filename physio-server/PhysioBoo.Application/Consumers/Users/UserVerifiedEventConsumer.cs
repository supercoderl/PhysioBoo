using MassTransit;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Commands.Users.UpdateUser;
using PhysioBoo.Application.Queries.VerificationTokens.GetByToken;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserVerifiedEventConsumer : IConsumer<UserVerifiedEvent>
    {
        private readonly IMediatorHandler _bus;
        private readonly TokenSettings _token;

        public UserVerifiedEventConsumer(
            IMediatorHandler bus,
            IOptions<TokenSettings> option
        )
        {
            _bus = bus;
            _token = option.Value;
        }

        public async Task Consume(ConsumeContext<UserVerifiedEvent> context)
        {
            ViewModels.VerificationTokens.VerificationTokenViewModel? token = await _bus.QueryAsync(new GetVerificationTokenByTokenQuery(context.Message.Token));
            if (token == null) return;

            VerificationType type = Enum.Parse<VerificationType>(context.Message.Type);

            switch (type)
            {
                case VerificationType.Email:
                    await _bus.SendCommandAsync(new UpdateUserCommand(
                        token.UserId,
                        new
                        {
                            IsVerified = true,
                            EmailVerifiedAt = (DateTime?)TimeZoneHelper.GetLocalTimeNow()
                        })
                    );
                    break;
                case VerificationType.Phone:
                    await _bus.SendCommandAsync(new UpdateUserCommand(
                        token.UserId,
                        new
                        {
                            PhoneVerifiedAt = (DateTime?)TimeZoneHelper.GetLocalTimeNow()
                        })
                    );
                    break;
            }
        }
    }
}
