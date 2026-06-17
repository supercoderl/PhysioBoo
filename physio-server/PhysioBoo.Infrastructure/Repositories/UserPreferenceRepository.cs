using Npgsql;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class UserPreferenceRepository : BaseRepository<UserPreference>, IUserPreferenceRepository
    {
        public UserPreferenceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<UserPreference>> GetUserPreferencesByUserId(Guid userId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_user_id"] = userId
            };

            List<UserPreference> result = await ExecutePostgresFunctionAsync<UserPreference>(
                "get_user_preferences_by_user_id",
                parameters,
                reader => MapUserPreference(reader)
            );

            return result;
        }

        public async Task<bool> BulkUpsertUserPreferenceAsync(Guid userId, Guid tenantId, string json, DateTime createdAt, Guid? createdBy)
        {
            string sql = @"
                INSERT INTO ""UserPreferences"" (""Id"", ""UserId"", ""Key"", ""Value"", ""Group"", ""TenantId"", ""CreatedAt"", ""CreatedBy"")
                SELECT 
                    gen_random_uuid(),
                    @userId,
                    p.""Key"",
                    p.""Value"",
                    p.""Group"",
                    @tenantId,
                    @createdAt,
                    @createdBy
                FROM jsonb_to_recordset(@json::jsonb) AS p(
                    ""Key"" text,
                    ""Value"" text,
                    ""Group"" text
                )
                ON CONFLICT (""UserId"", ""Key"")
                DO UPDATE SET
                    ""Value"" = EXCLUDED.""Value"",
                    ""Group"" = EXCLUDED.""Group""
                WHERE 
                    ""UserPreferences"".""Value"" IS DISTINCT FROM EXCLUDED.""Value""
                    OR ""UserPreferences"".""Group"" IS DISTINCT FROM EXCLUDED.""Group"";
            ";

            NpgsqlParameter[] parameters = new[]
            {
                new NpgsqlParameter("@userId", userId),
                new NpgsqlParameter("@json", NpgsqlTypes.NpgsqlDbType.Jsonb)
                {
                    Value = json
                },
                new NpgsqlParameter("@tenantId", tenantId),
                new NpgsqlParameter("@createdAt", createdAt),
                new NpgsqlParameter("@createdBy", createdBy)
            };

            int rowsAffected = await ExecuteNonQueryAsync(sql, parameters);
            return rowsAffected > 0;
        }

        private static UserPreference MapUserPreference(NpgsqlDataReader reader)
        {
            return new UserPreference(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetFieldValue<Guid>("UserId"),
                reader.GetString("Key"),
                reader.GetString("Value"),
                reader.GetString("Group")
            );
        }
    }
}
