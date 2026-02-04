using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_MediaFileRepository : BaseRepository<Sys_MediaFile>, ISys_MediaFileRepository
    {
        public Sys_MediaFileRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
