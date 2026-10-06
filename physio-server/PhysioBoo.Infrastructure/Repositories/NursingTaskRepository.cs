using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class NursingTaskRepository : BaseRepository<NursingTask>, INursingTaskRepository
    {
        public NursingTaskRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
