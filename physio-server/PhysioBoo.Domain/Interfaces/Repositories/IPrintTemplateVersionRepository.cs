using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IPrintTemplateVersionRepository : IRepository<PrintTemplateVersion>
    {
        Task<PrintTemplateVersion?> GetByTemplateIdAsync(Guid templateId, CancellationToken cancellationToken);
    }
}
