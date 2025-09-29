using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabOrderRepository : BaseRepository<LabOrder>, ILabOrderRepository
    {
        public LabOrderRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
