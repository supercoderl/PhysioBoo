using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrescriptionClinicalWarningRepository : BaseRepository<PrescriptionClinicalWarning>, IPrescriptionClinicalWarningRepository
    {
        public PrescriptionClinicalWarningRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
