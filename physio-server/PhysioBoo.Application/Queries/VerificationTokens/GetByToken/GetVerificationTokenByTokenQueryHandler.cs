using MediatR;
using PhysioBoo.Application.Queries.VerificationTokens.GetById;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;
using System.Data;
using System.Text;

namespace PhysioBoo.Application.Queries.VerificationTokens.GetByToken
{
    public sealed class GetVerificationTokenByTokenQueryHandler : IRequestHandler<GetVerificationTokenByTokenQuery, VerificationTokenViewModel?>
    {
        private readonly IVerificationTokenRepository _verificationTokenRepository;
        private readonly IMediatorHandler _bus;

        public GetVerificationTokenByTokenQueryHandler(
            IVerificationTokenRepository verificationTokenRepository,
            IMediatorHandler bus
        )
        {
            _verificationTokenRepository = verificationTokenRepository;
            _bus = bus;
        }

        public async Task<VerificationTokenViewModel?> Handle(GetVerificationTokenByTokenQuery request, CancellationToken cancellationToken)
        {
            var parameters = new Dictionary<string, object>
            {
                ["p_token"] = request.Token
            };

            var result = await _verificationTokenRepository.ExecutePostgresFunctionAsync<VerificationToken>(
                "get_tokens_dynamic",
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
                }
            );

            if (!result.Any())
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetVerificationTokenByIdQuery),
                    $"Token does not exists. Please check again your url.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return VerificationTokenViewModel.FromVerificationToken(result.First());
        }
    }
}
