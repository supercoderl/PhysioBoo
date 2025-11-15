using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RolePermissionRepository : BaseRepository<RolePermission>, IRolePermissionRepository
    {
        public RolePermissionRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<List<RolePermission>> GetPermissionIdsByRoleIdAsync(Guid roleId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_role_id"] = roleId
            };

            List<RolePermission> result = await ExecutePostgresFunctionAsync<RolePermission>(
                "get_permission_ids_by_role_id",
                parameters,
                reader => new RolePermission(
                    Guid.NewGuid(),
                    roleId,
                    reader.GetFieldValue<Guid>("PermissionId")
                )
            );

            return result;
        }
    }
}
