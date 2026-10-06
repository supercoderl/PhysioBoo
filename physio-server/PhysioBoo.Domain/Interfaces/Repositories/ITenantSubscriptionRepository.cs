using PhysioBoo.Domain.Entities.Platform;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ITenantSubscriptionRepository : IRepository<TenantSubscription>
    {
        /// <summary>
        /// Tracks a new entity so it is saved with the unit of work.
        /// </summary>
        void Add(TenantSubscription entity);
    }
}
