using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class AdminMenuRepository : BaseRepository<AdminMenu>, IAdminMenuRepository
    {
        public AdminMenuRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
