using PhysioBoo.Domain.Entities.Geography;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class GeoWardRepository : BaseRepository<GeoWard>, IGeoWardRepository
    {
        public GeoWardRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
