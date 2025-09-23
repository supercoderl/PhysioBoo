using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HospitalRepository : BaseRepository<Hospital>, IHospitalRepository
    {
        public HospitalRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
