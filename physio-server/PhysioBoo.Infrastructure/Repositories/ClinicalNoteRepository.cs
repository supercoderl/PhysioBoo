using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ClinicalNoteRepository : BaseRepository<ClinicalNote>, IClinicalNoteRepository
    {
        public ClinicalNoteRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
