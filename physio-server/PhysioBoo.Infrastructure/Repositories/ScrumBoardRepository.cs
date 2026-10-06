using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ScrumBoardRepository : BaseRepository<ScrumBoard>, IScrumBoardRepository
    {
        public ScrumBoardRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
