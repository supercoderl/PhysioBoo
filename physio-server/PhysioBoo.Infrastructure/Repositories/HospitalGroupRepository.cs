using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HospitalGroupRepository : BaseRepository<HospitalGroup>, IHospitalGroupRepository
    {
        public HospitalGroupRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
