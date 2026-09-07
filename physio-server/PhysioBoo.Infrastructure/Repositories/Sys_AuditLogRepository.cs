using PhysioBoo.Domain.Entities.System;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_AuditLogRepository : BaseRepository<Sys_AuditLog>, ISys_AuditLogRepository
    {
        public Sys_AuditLogRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
