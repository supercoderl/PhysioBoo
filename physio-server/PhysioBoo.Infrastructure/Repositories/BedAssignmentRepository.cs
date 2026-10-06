using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class BedAssignmentRepository : BaseRepository<BedAssignment>, IBedAssignmentRepository
    {
        public BedAssignmentRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
