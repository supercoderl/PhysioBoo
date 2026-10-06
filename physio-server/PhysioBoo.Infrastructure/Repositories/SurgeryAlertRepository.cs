using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SurgeryAlertRepository : BaseRepository<SurgeryAlert>, ISurgeryAlertRepository
    {
        public SurgeryAlertRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
