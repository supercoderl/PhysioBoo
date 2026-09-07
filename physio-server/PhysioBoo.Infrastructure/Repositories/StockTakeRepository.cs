using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class StockTakeRepository : BaseRepository<StockTake>, IStockTakeRepository
    {
        public StockTakeRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
