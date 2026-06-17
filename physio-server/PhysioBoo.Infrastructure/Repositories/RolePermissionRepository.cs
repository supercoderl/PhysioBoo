using Npgsql;
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

        public async Task AssignPermissionsAsync(Guid roleId, string perJson)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_role_id"] = roleId,
                ["p_permissions_json"] = perJson
            };

            await ExecutePostgresFunctionAsync(
                "assign_permissions",
                parameters,
                reader => reader
            );
        }

        public async Task<RolePermission?> GetByBothIdAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_role_id"] = roleId,
                ["p_permission_id"] = permissionId
            };

            List<RolePermission> result = await ExecutePostgresFunctionAsync(
                " get_by_role_and_permission_id",
                parameters,
                MapRolePermission,
                cancellationToken
            );

            return result.FirstOrDefault();
        }

        private static RolePermission MapRolePermission(NpgsqlDataReader reader)
        {
            return new RolePermission(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetFieldValue<Guid>("RoleId"),
                reader.GetFieldValue<Guid>("PermissionId")
            );
        }
    }
}
