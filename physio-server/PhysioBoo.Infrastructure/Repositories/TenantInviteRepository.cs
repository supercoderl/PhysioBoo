using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class TenantInviteRepository : BaseRepository<TenantInvite>, ITenantInviteRepository
    {
        public TenantInviteRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<TenantInvite?> GetByTokenAsync(string token, CancellationToken ct = default)
        {
            return await GetAllNoTracking(filter: x => x.Token == token).FirstOrDefaultAsync(ct);
        }
    }
}
