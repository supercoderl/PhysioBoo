using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrescriptionItemRepository : BaseRepository<PrescriptionItem>, IPrescriptionItemRepository
    {
        public PrescriptionItemRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
