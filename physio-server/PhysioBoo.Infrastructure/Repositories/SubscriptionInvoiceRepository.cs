using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SubscriptionInvoiceRepository : BaseRepository<SubscriptionInvoice>, ISubscriptionInvoiceRepository
    {
        public SubscriptionInvoiceRepository(ApplicationDbContext context) : base(context)
        {

        }

        public void Add(SubscriptionInvoice entity)
        {
            DbSet.Add(entity);
        }
    }
}
