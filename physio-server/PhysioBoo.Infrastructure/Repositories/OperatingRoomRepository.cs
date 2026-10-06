using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class OperatingRoomRepository : BaseRepository<OperatingRoom>, IOperatingRoomRepository
    {
        public OperatingRoomRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
