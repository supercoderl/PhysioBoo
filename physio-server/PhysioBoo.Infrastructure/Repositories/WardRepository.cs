using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class WardRepository : BaseRepository<Ward>, IWardRepository
    {
        public WardRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
