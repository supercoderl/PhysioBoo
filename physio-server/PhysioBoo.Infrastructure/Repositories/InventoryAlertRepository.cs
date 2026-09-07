using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class InventoryAlertRepository : BaseRepository<InventoryAlert>, IInventoryAlertRepository
    {
        public InventoryAlertRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
