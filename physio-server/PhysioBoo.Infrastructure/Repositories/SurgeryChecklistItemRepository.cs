using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SurgeryChecklistItemRepository : BaseRepository<SurgeryChecklistItem>, ISurgeryChecklistItemRepository
    {
        public SurgeryChecklistItemRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
