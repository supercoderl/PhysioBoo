using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class NursingAssignmentRepository : BaseRepository<NursingAssignment>, INursingAssignmentRepository
    {
        public NursingAssignmentRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
