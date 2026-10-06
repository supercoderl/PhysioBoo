using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SurgeryEquipmentItemRepository : BaseRepository<SurgeryEquipmentItem>, ISurgeryEquipmentItemRepository
    {
        public SurgeryEquipmentItemRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
