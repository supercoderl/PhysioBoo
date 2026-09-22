using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HomeSettingRepository : BaseRepository<HomeSetting>, IHomeSettingRepository
    {
        public HomeSettingRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<HomeSetting?> GetByTenantIdAsync(Guid tenantId, CancellationToken ct)
        {
            return await DbSet.FirstOrDefaultAsync(x => x.TenantId == tenantId, ct);
        }
    }
}
