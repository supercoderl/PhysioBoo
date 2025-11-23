using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

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
    }
}
