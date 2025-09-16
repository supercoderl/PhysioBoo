using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;
using System.Data;
using System.Text;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommandHandler : CommandHandlerBase, IRequestHandler<ResendVerificationCommand>
    {
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public ResendVerificationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationTokenRepository verificationTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var parameters = new Dictionary<string, object>
            {
                { "p_user_id", request.UserId }
            };

            var result = await _verificationTokenRepository.ExecutePostgresFunctionAsync<VerificationToken>(
                "get_token_by_user_id",
                parameters,
                reader =>
                {
                    var token = new Domain.Entities.Core.VerificationToken(
                        reader.GetFieldValue<Guid>("Id"),
                        reader.GetFieldValue<Guid>("UserId"),
                        reader.GetString("Token"),
                        !reader.IsDBNull("ExpiresAt") ? reader.GetDateTime("ExpiresAt") : TimeZoneHelper.GetLocalTimeNow(),
                        Enum.Parse<VerificationType>(reader.GetString("Type"))
                    );

                    token.SetIsUsed(reader.GetBoolean("IsUsed"));

                    return token;
                },
                cancellationToken
            );

            if(result.Any())
            {
                var verificationToken = result.First();
                await Bus.RaiseEventAsync(new EmailVerificationTokenGeneratedEvent(request.UserId, verificationToken.Token, verificationToken.ExpiresAt));
            } else
            {
                await Bus.RaiseEventAsync(new UsersCreatedEvent(new List<Guid>
                {
                    request.UserId,
                }));
            }
        }
    }
}
