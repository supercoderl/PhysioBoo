using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_AppVersionRepository : BaseRepository<Sys_AppVersion>, ISys_AppVersionRepository
    {
        public Sys_AppVersionRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
