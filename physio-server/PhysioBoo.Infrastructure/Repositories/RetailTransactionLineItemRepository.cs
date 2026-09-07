using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RetailTransactionLineItemRepository : BaseRepository<RetailTransactionLineItem>, IRetailTransactionLineItemRepository
    {
        public RetailTransactionLineItemRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
