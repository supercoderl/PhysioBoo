using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class TenantSubscriptionRepository : BaseRepository<TenantSubscription>, ITenantSubscriptionRepository
    {
        public TenantSubscriptionRepository(ApplicationDbContext context) : base(context)
        {

        }

        public void Add(TenantSubscription entity)
        {
            DbSet.Add(entity);
        }
    }
}
