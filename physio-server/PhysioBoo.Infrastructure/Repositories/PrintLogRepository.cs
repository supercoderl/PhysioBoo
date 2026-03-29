using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrintLogRepository : BaseRepository<PrintLog>, IPrintLogRepository
    {
        public PrintLogRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
