using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabTestRepository : BaseRepository<LabTest>, ILabTestRepository
    {
        public LabTestRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
