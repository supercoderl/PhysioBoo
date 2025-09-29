using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabTestCategoryRepository : BaseRepository<LabTestCategory>, ILabTestCategoryRepository
    {
        public LabTestCategoryRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
