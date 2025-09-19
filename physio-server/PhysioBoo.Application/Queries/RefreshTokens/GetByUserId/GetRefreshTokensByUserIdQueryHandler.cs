using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Data;
using System.Text;

namespace PhysioBoo.Application.Queries.RefreshTokens.GetByUserId
{
    public sealed class GetRefreshTokensByUserIdQueryHandler : IRequestHandler<GetRefreshTokensByUserIdQuery, List<RefreshToken>>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public GetRefreshTokensByUserIdQueryHandler(IRefreshTokenRepository refreshTokenRepository)
        {
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<List<RefreshToken>> Handle(GetRefreshTokensByUserIdQuery request, CancellationToken cancellationToken)
        {
            var parameters = new Dictionary<string, object>
            {
                ["p_user_id"] = request.UserId
            };

            var result = await _refreshTokenRepository.ExecutePostgresFunctionAsync<RefreshToken>(
                "get_refresh_tokens_dynamic",
                parameters,
                reader =>
                {
                    var token = new Domain.Entities.Core.RefreshToken(
                        reader.GetFieldValue<Guid>("Id"),
                        reader.GetFieldValue<Guid>("UserId"),
                        reader.GetString("Token"),
                        reader.GetDateTime("ExpiresAt")
                    );

                    return token;
                }
            );

            return result;
        }
    }
}
