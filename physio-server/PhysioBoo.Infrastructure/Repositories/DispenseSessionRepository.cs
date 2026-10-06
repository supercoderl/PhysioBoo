using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DispenseSessionRepository : BaseRepository<DispenseSession>, IDispenseSessionRepository
    {
        public DispenseSessionRepository(ApplicationDbContext context) : base(context)
        {

        }

        public void Add(DispenseSession session)
        {
            DbSet.Add(session);
        }
    }
}
