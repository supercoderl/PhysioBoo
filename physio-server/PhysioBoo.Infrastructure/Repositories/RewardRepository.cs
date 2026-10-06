using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RewardRepository : BaseRepository<Reward>, IRewardRepository
    {
        public RewardRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
