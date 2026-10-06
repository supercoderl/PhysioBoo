using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LessonCompletionRepository : BaseRepository<LessonCompletion>, ILessonCompletionRepository
    {
        public LessonCompletionRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
