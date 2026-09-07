using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RetailPaymentSplitRepository : BaseRepository<RetailPaymentSplit>, IRetailPaymentSplitRepository
    {
        public RetailPaymentSplitRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
