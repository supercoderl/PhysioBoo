using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IHomeSettingRepository : IRepository<HomeSetting>
    {
        Task<HomeSetting?> GetByTenantIdAsync(Guid tenantId, CancellationToken ct);
    }
}
