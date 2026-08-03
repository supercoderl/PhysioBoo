using PhysioBoo.Domain.Entities.System;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IPrintTemplateRepository : IRepository<PrintTemplate>
    {
        Task<DbResult<Guid>> InsertTemplateWithVersion(PrintTemplate printTemplate, PrintTemplateVersion printTemplateVersion, CancellationToken ct);
        Task<PrintTemplate?> GetByCodeAsync(string code, CancellationToken ct);
    }
}
