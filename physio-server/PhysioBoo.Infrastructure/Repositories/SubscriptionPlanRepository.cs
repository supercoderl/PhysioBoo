using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SubscriptionPlanRepository : BaseRepository<SubscriptionPlan>, ISubscriptionPlanRepository
    {
        public SubscriptionPlanRepository(ApplicationDbContext context) : base(context)
        {

        }

        public void Add(SubscriptionPlan entity)
        {
            DbSet.Add(entity);
        }
    }
}
