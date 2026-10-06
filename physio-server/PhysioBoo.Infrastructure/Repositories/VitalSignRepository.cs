using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class VitalSignRepository : BaseRepository<VitalSign>, IVitalSignRepository
    {
        public VitalSignRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
