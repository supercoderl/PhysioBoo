using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class BillItemRepository : BaseRepository<BillItem>, IBillItemRepository
    {
        public BillItemRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
