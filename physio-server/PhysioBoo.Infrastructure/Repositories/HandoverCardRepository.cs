using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HandoverCardRepository : BaseRepository<HandoverCard>, IHandoverCardRepository
    {
        public HandoverCardRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
