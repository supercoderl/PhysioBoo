using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IRolePermissionRepository : IRepository<RolePermission>
    {
        /// <summary>Grants (<c>true</c>) or revokes (<c>false</c>) permissions, keyed by permission code, in one transaction.</summary>
        Task AssignPermissionsAsync(Guid roleId, IReadOnlyDictionary<string, bool> permissions, CancellationToken ct = default);
        Task<RolePermission?> GetByBothIdAsync(Guid roleId, Guid permissionId, CancellationToken ct = default);
    }
}
