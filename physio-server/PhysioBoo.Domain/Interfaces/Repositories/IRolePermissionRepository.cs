using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IRolePermissionRepository : IRepository<RolePermission>
    {
        Task AssignPermissionsAsync(Guid roleId, string perJson);
        Task<RolePermission?> GetByBothIdAsync(Guid roleId, Guid permissionId, CancellationToken ct = default);
    }
}
