using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrintTemplateVersionRepository : BaseRepository<PrintTemplateVersion>, IPrintTemplateVersionRepository
    {
        public PrintTemplateVersionRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
