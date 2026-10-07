using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabAlertRepository : BaseRepository<LabAlert>, ILabAlertRepository
    {
        public LabAlertRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
