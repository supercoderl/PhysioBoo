using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;
using System.Data;
using System.Data.Common;

namespace PhysioBoo.Application.Services
{
    public class VerificationService : IVerificationService
    {
        private readonly IMediatorHandler _bus;
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public VerificationService(
            IMediatorHandler bus,
            IVerificationTokenRepository verificationTokenRepository
        )
        {
            _bus = bus;
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task SendAsync(Guid userId, string? email, VerificationType? type, CancellationToken cancellationToken)
        {
            var parameters = new Dictionary<string, object>
            {
                { "p_user_id", userId }
            };

            if (type.HasValue)
                parameters.Add("p_type", type.Value.ToString());

            var result = await _verificationTokenRepository.ExecutePostgresFunctionAsync<VerificationToken>(
                "get_tokens_dynamic",
                parameters,
                reader => MapToken(reader),
                cancellationToken
            );

            if (result.Any())
            {
                var token = result.First();
                await _bus.RaiseEventAsync(new EmailVerificationTokenGeneratedEvent(
                    userId, email, token.Token, token.ExpiresAt, type?.ToString() ?? VerificationType.Email.ToString()
                ));
            }
            else
            {
                await _bus.RaiseEventAsync(new UsersCreatedEvent(userId, type?.ToString() ?? VerificationType.Email.ToString()));
            }
        }

        private VerificationToken MapToken(DbDataReader reader)
        {
            var token = new VerificationToken(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetFieldValue<Guid>("UserId"),
                reader.GetString("Token"),
                !reader.IsDBNull("ExpiresAt") ? reader.GetDateTime("ExpiresAt") : TimeZoneHelper.GetLocalTimeNow(),
                Enum.Parse<VerificationType>(reader.GetString("Type"))
            );

            token.SetIsUsed(reader.GetBoolean("IsUsed"));
            return token;
        }
    }
}
