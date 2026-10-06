using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class MedicationAdministrationRepository : BaseRepository<MedicationAdministration>, IMedicationAdministrationRepository
    {
        public MedicationAdministrationRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
