using Microsoft.EntityFrameworkCore;
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

        /// <summary>
        /// Retrieves all permission identifiers assigned to the specified role.
        /// </summary>
        /// <param name="roleId">The unique identifier of the role.</param>
        /// <param name="ct">A token to cancel the asynchronous operation.</param>
        /// <returns>A collection of permission identifiers associated with the role.</returns>
        public async Task<IEnumerable<string>> GetPermissionIdsByRoleAsync(Guid roleId, CancellationToken ct = default)
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

        /// <summary>
        /// Retrieves the identifier of the role corresponding to the specified role enumeration.
        /// </summary>
        /// <param name="role">The application role enumeration.</param>
        /// <returns>A collection of role identifiers matching the specified role.</returns>
        public async Task<Guid?> GetIdByEnumAsync(Domain.Enums.Role role)
        {
            Role? result = await DbSet.FirstOrDefaultAsync(r => r.Code.ToLower().Equals(role.ToString().ToLower(), StringComparison.OrdinalIgnoreCase));
            return result?.Id;
        }
    }
}
