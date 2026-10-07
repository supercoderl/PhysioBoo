using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HomeFeatureRepository : BaseRepository<HomeFeature>, IHomeFeatureRepository
    {
        public HomeFeatureRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
