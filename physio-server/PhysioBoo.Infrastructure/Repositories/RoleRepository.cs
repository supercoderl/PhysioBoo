using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RoleRepository : BaseRepository<Role>, IRoleRepository
    {
        public RoleRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<IEnumerable<string>> GetPermissionIdsByRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_role_id"] = roleId
            };

            List<string> result = await ExecutePostgresFunctionAsync<string>(
                "get_permissionid_by_roleid",
                parameters,
                reader => reader.GetFieldValue<Guid>("PermissionsId").ToString()
            );

            return result;
        }

        public async Task<IEnumerable<string>> GetPermissionIdByRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_role_id"] = roleId
            };

            List<string> result = await ExecutePostgresFunctionAsync<string>(
                "get_permissionid_by_roleid",
                parameters,
                reader => reader.GetFieldValue<Guid>("PermissionsId").ToString()
            );

            return result;
        }
    }
}
