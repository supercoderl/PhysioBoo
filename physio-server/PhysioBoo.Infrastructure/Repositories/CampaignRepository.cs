using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class CampaignRepository : BaseRepository<Campaign>, ICampaignRepository
    {
        public CampaignRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
