using Npgsql;
using NpgsqlTypes;
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

        public async Task AssignRolesAsync(Guid userId, string roleJson, Guid? assignerId)
        {
            NpgsqlParameter pUserId = new NpgsqlParameter("p_user_id", userId);
            NpgsqlParameter pRolesJson = new NpgsqlParameter("p_roles_json", NpgsqlDbType.Jsonb)
            {
                Value = roleJson
            };
            NpgsqlParameter pAssigner = new NpgsqlParameter("p_assigner", assignerId ?? (object)DBNull.Value);
            string sql = "SELECT public.assign_roles(@p_user_id, @p_roles_json, @p_assigner)";

            await ExecuteNonQueryAsync(sql, new[] { pUserId, pRolesJson, pAssigner });
        }
    }
}
