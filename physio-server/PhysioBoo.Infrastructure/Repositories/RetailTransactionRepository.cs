using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RetailTransactionRepository : BaseRepository<RetailTransaction>, IRetailTransactionRepository
    {
        public RetailTransactionRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
