using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class StockTakeActivityRepository : BaseRepository<StockTakeActivity>, IStockTakeActivityRepository
    {
        public StockTakeActivityRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
