using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ClinicalAlertRepository : BaseRepository<ClinicalAlert>, IClinicalAlertRepository
    {
        public ClinicalAlertRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
