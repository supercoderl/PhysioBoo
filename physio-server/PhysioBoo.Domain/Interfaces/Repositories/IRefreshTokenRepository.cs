using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IRefreshTokenRepository : IRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string refreshToken);
    }
}
