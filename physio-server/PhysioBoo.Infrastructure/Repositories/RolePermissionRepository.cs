using Microsoft.EntityFrameworkCore;
using Npgsql;
using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RolePermissionRepository : BaseRepository<RolePermission>, IRolePermissionRepository
    {
        private readonly ApplicationDbContext _context;

        public RolePermissionRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task AssignPermissionsAsync(Guid roleId, IReadOnlyDictionary<string, bool> permissions, CancellationToken ct = default)
        {
            string[] codes = permissions.Keys.ToArray();
            Dictionary<Guid, string> permissionCodes = await _context.Permissions
                .Where(p => codes.Contains(p.Code))
                .ToDictionaryAsync(p => p.Id, p => p.Code, ct);

            if (permissionCodes.Count == 0)
            {
                return;
            }

            // Soft-deleted rows still occupy the unique (RoleId, PermissionId) index, so they must be seen and revived.
            List<RolePermission> existing = await _context.RolePermissions
                .IgnoreQueryFilters()
                .Where(rp => rp.RoleId == roleId && permissionCodes.Keys.Contains(rp.PermissionId))
                .ToListAsync(ct);

            foreach (KeyValuePair<Guid, string> permission in permissionCodes)
            {
                RolePermission? current = existing.FirstOrDefault(rp => rp.PermissionId == permission.Key);
                bool granted = permissions[permission.Value];

                if (granted && current is null)
                {
                    _context.RolePermissions.Add(new RolePermission(Guid.NewGuid(), roleId, permission.Key));
                }
                else if (granted && current!.DeletedAt is not null)
                {
                    current.Undelete();
                }
                else if (!granted && current is not null)
                {
                    _context.RolePermissions.Remove(current);
                }
            }

            await _context.SaveChangesAsync(ct);
        }

        public async Task<RolePermission?> GetByBothIdAsync(Guid roleId, Guid permissionId, CancellationToken ct)
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
                ct
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
