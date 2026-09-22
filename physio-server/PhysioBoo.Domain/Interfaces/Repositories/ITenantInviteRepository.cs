using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ITenantInviteRepository : IRepository<TenantInvite>
    {
        Task<TenantInvite?> GetByTokenAsync(string token, CancellationToken ct = default);
    }
}
