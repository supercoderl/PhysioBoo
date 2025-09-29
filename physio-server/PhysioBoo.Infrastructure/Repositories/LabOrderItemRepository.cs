using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabOrderItemRepository : BaseRepository<LabOrderItem>, ILabOrderItemRepository
    {
        public LabOrderItemRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
