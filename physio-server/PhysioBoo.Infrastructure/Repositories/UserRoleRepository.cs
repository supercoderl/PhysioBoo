using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class UserRoleRepository : BaseRepository<UserRole>, IUserRoleRepository
    {
        public UserRoleRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task AssignRolesAsync(Guid userId, string roleJson)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_user_id"] = userId,
                ["p_roles_json"] = roleJson
            };

            await ExecutePostgresFunctionAsync(
                "assign_roles",
                parameters,
                reader => reader
            );
        }
    }
}
