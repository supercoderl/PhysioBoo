using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_DeviceRepository : BaseRepository<Sys_Device>, ISys_DeviceRepository
    {
        public Sys_DeviceRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
