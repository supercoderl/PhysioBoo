using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PermissionRepository : BaseRepository<Permission>, IPermissionRepository
    {
        public PermissionRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<List<Permission>> GetByCodesAsync(string[] codes)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_codes"] = codes
            };

            List<Permission> result = await ExecutePostgresFunctionAsync<Permission>(
                "get_permissions_by_codes",
                parameters,
                reader => new Permission(
                    reader.GetFieldValue<Guid>("Id"),
                    string.Empty,
                    reader.GetString("Code"),
                    null
                )
            );

            return result;
        }

        public async Task<List<string>> GetOwnerPermissionCodes(Guid userId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_user_id"] = userId
            };

            List<string> result = await ExecutePostgresFunctionAsync<string>(
                "get_owner_permission_codes",
                parameters,
                reader => reader.GetString("Code")
            );

            return result;
        }
    }
}
