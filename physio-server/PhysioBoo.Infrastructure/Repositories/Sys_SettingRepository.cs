using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_SettingRepository : BaseRepository<Sys_Setting>, ISys_SettingRepository
    {
        public Sys_SettingRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
