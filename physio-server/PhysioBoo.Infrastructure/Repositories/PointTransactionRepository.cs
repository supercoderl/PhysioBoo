using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PointTransactionRepository : BaseRepository<PointTransaction>, IPointTransactionRepository
    {
        public PointTransactionRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
