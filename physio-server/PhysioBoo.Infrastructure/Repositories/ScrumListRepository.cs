using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ScrumListRepository : BaseRepository<ScrumList>, IScrumListRepository
    {
        public ScrumListRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
