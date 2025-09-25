using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class BillRepository : BaseRepository<Bill>, IBillRepository
    {
        public BillRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
