using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class MedicineInventoryRepository : BaseRepository<MedicineInventory>, IMedicineInventoryRepository
    {
        public MedicineInventoryRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
