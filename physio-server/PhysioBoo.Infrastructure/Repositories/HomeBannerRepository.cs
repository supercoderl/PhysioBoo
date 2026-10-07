using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HomeBannerRepository : BaseRepository<HomeBanner>, IHomeBannerRepository
    {
        public HomeBannerRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
