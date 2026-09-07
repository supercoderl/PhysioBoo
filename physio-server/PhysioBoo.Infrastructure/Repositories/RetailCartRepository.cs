using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RetailCartRepository : BaseRepository<RetailCart>, IRetailCartRepository
    {
        public RetailCartRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
