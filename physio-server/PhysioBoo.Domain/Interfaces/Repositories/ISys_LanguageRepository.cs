using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ISys_LanguageRepository : IRepository<Sys_Language>
    {
        Task<Sys_Language?> GetByCodeAsync(string code);
    }
}
