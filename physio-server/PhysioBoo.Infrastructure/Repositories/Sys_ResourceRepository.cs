using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_ResourceRepository : BaseRepository<Sys_Resource>, ISys_ResourceRepository
    {
        public Sys_ResourceRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
