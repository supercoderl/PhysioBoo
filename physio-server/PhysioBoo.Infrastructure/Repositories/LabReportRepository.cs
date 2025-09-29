using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabReportRepository : BaseRepository<LabReport>, ILabReportRepository
    {
        public LabReportRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
