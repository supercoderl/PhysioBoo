using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HomeTestimonialRepository : BaseRepository<HomeTestimonial>, IHomeTestimonialRepository
    {
        public HomeTestimonialRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
