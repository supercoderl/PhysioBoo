using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ImagingReportRepository : BaseRepository<ImagingReport>, IImagingReportRepository
    {
        public ImagingReportRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
