using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IPermissionRepository : IRepository<Permission>
    {
        Task<List<Permission>> GetByCodesAsync(string[] codes);
        Task<List<string>> GetOwnerPermissionCodes(Guid userId);
    }
}
