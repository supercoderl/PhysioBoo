using Npgsql;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Utils;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var parameters = new Dictionary<string, object>
            {
                ["p_email"] = email
            };

            var result = await ExecutePostgresFunctionAsync<User>(
                "get_user_for_login",
                parameters,
                reader => MapUserForLogin(reader)
            );

            return result.FirstOrDefault();
        }

        private static User MapUserForLogin(NpgsqlDataReader reader)
        {
            var user = new User(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("Email"),
                reader.GetString("Phone"),
                reader.GetString("PasswordHash"),
                Enum.Parse<Role>(reader.GetString("Role")),
                reader.IsDBNull("CreatedBy") ? null : reader.GetGuid("CreatedBy")
            );

            // Only set properties needed for login validation
            user.SetIsActive(reader.GetBoolean("IsActive"));
            user.SetIsVerified(reader.GetBoolean("IsVerified"));
            user.SetEmailVerifiedAt(reader.IsDBNull("EmailVerifiedAt") ? null : reader.GetDateTime("EmailVerifiedAt"));
            user.SetFailedLoginAttempts(reader.GetInt32("FailedLoginAttempts"));
            user.SetAccountLockedUntil(reader.IsDBNull("AccountLockedUntil") ? null : reader.GetDateTime("AccountLockedUntil"));

            return user;
        }

        /// <summary>
        /// Optimized update for failed login attempts
        /// Uses raw SQL for maximum performance
        /// </summary>
        public async Task<bool> UpdateUserFailedLoginAsync(Guid id, int failedLoginAttempts, DateTime? accountLockedUntil)
        {
            string sql;
            List<NpgsqlParameter> parameters;

            if (accountLockedUntil.HasValue)
            {
                sql = @"UPDATE ""Users"" SET ""FailedLoginAttempts"" = @failedLoginAttempts, ""AccountLockedUntil"" = @accountLockedUntil, ""UpdatedAt"" = @updatedAt WHERE ""Id"" = @userId";
                parameters = new List<NpgsqlParameter>
                {
                    new("@failedLoginAttempts", failedLoginAttempts),
                    new("@accountLockedUntil", accountLockedUntil.Value),
                    new("@updatedAt", TimeZoneHelper.GetLocalTimeNow()),
                    new("@userId", id)
                };
            }
            else
            {
                sql = @"UPDATE ""Users"" SET ""FailedLoginAttempts"" = @failedLoginAttempts, ""UpdatedAt"" = @updatedAt WHERE ""Id"" = @userId";
                parameters = new List<NpgsqlParameter>
                {
                    new("@failedLoginAttempts", failedLoginAttempts),
                    new("@updatedAt", TimeZoneHelper.GetLocalTimeNow()),
                    new("@userId", id)
                };
            }

            var rowsAffected = await ExecuteNonQueryAsync(sql, parameters.ToArray());
            return rowsAffected > 0;
        }

        /// <summary>
        /// Optimized update for last login time only
        /// Uses raw SQL for maximum performance
        /// </summary>
        public async Task<bool> UpdateLastLoginAsync(Guid id, DateTime? lastLoginAt)
        {
            var rowsAffected = await ExecuteNonQueryAsync(
                @"UPDATE ""Users"" SET ""LastLoginAt"" = @lastLoginAt, ""UpdatedAt"" = @updatedAt WHERE ""Id"" = @userId",
                new List<NpgsqlParameter>
                {
                    new NpgsqlParameter("@lastLoginAt", lastLoginAt),
                    new NpgsqlParameter("@updatedAt", TimeZoneHelper.GetLocalTimeNow()),
                    new NpgsqlParameter("@userId", id)
                }.ToArray()
            );

            return rowsAffected > 0;
        }
    }
}
