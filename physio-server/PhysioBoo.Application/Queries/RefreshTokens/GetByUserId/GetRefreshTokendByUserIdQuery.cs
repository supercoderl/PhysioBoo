using MediatR;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Queries.RefreshTokens.GetByUserId
{
    public sealed record GetRefreshTokensByUserIdQuery(Guid UserId) : IRequest<List<RefreshToken>>;
}
