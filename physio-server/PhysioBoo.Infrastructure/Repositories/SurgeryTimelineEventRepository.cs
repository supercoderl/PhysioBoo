using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SurgeryTimelineEventRepository : BaseRepository<SurgeryTimelineEvent>, ISurgeryTimelineEventRepository
    {
        public SurgeryTimelineEventRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
