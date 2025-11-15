using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IRolePermissionRepository : IRepository<RolePermission>
    {
        Task<List<RolePermission>> GetPermissionIdsByRoleIdAsync(Guid roleId);
    }
}
