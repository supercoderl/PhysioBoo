using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrintTemplateRepository : BaseRepository<PrintTemplate>, IPrintTemplateRepository
    {
        public PrintTemplateRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
