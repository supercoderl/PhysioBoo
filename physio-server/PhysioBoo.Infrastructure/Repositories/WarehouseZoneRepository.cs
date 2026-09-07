using PhysioBoo.Domain.Entities.Support;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class WarehouseZoneRepository : BaseRepository<WarehouseZone>, IWarehouseZoneRepository
    {
        public WarehouseZoneRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
