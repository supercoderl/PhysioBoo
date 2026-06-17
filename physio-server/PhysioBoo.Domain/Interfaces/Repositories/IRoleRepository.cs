using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<IEnumerable<string>> GetPermissionIdsByRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
    }
}
