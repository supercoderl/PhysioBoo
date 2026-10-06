using PhysioBoo.Domain.Entities.Platform;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ISubscriptionInvoiceRepository : IRepository<SubscriptionInvoice>
    {
        /// <summary>
        /// Tracks a new entity so it is saved with the unit of work.
        /// </summary>
        void Add(SubscriptionInvoice entity);
    }
}
