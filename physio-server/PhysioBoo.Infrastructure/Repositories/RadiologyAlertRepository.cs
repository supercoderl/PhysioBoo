using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RadiologyAlertRepository : BaseRepository<RadiologyAlert>, IRadiologyAlertRepository
    {
        public RadiologyAlertRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
