using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class StockTakeItemRepository : BaseRepository<StockTakeItem>, IStockTakeItemRepository
    {
        public StockTakeItemRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
