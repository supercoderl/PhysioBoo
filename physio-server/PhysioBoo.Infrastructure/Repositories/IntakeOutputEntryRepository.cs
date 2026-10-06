using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class IntakeOutputEntryRepository : BaseRepository<IntakeOutputEntry>, IIntakeOutputEntryRepository
    {
        public IntakeOutputEntryRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
