using Npgsql;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Utils;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class UserRepository : BaseRepository<User>, IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_email"] = email
            };

            List<User> result = await ExecutePostgresFunctionAsync<User>(
                "get_user_for_login",
                parameters,
                MapUserSummary
            );

            return result.FirstOrDefault();
        }

        public async Task<User?> GetByIdentifierAsync(string identifier)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_identifier"] = identifier
            };

            List<User> result = await ExecutePostgresFunctionAsync<User>(
                "get_identifier_for_login",
                parameters,
                MapUserForLogin
            );

            return result.FirstOrDefault();
        }

        private static User MapUserSummary(NpgsqlDataReader reader)
        {
            User user = new User(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("Email"),
                reader.GetString("Phone"),
                reader.GetString("PasswordHash")
            );

            // Only set properties needed for login validation
            if (!reader.IsDBNull("CreatedBy"))
            {
                user.SetCreatedBy(reader.GetGuid("CreatedBy"));
            }
            user.SetIsActive(reader.GetBoolean("IsActive"));
            user.SetIsVerified(reader.GetBoolean("IsVerified"));
            user.SetEmailVerifiedAt(reader.IsDBNull("EmailVerifiedAt") ? null : reader.GetDateTime("EmailVerifiedAt"));
            user.SetFailedLoginAttempts(reader.GetInt32("FailedLoginAttempts"));
            user.SetAccountLockedUntil(reader.IsDBNull("AccountLockedUntil") ? null : reader.GetDateTime("AccountLockedUntil"));
            user.SetTenantId(reader.GetGuid("TenantId"));

            return (user);
        }

        private static User MapUserForLogin(NpgsqlDataReader reader)
        {
            User user = new User(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("Email"),
                reader.GetString("Phone"),
                reader.GetString("PasswordHash")
            );

            // Only set properties needed for login validation
            if (!reader.IsDBNull("CreatedBy"))
            {
                user.SetCreatedBy(reader.GetGuid("CreatedBy"));
            }
            user.SetIsActive(reader.GetBoolean("IsActive"));
            user.SetIsVerified(reader.GetBoolean("IsVerified"));
            user.SetEmailVerifiedAt(reader.IsDBNull("EmailVerifiedAt") ? null : reader.GetDateTime("EmailVerifiedAt"));
            user.SetFailedLoginAttempts(reader.GetInt32("FailedLoginAttempts"));
            user.SetAccountLockedUntil(reader.IsDBNull("AccountLockedUntil") ? null : reader.GetDateTime("AccountLockedUntil"));
            user.SetTenantId(reader.GetGuid("TenantId"));

            string[] roles = reader.GetFieldValue<string[]>("Roles");
            string[] permissions = reader.GetFieldValue<string[]>("Permissions");

            // Wrap the flat role/permission codes into a single synthetic role
            // so LoginUserCommandHandler can walk User.UserRoles -> Role.RolePermissions -> Permission.Code
            Role loginRole = new Role(Guid.NewGuid(), "Login", string.Join(",", roles), null, null, null);
            foreach (string permissionCode in permissions)
            {
                Permission permission = new Permission(Guid.NewGuid(), permissionCode, permissionCode, null);
                RolePermission rolePermission = new RolePermission(Guid.NewGuid(), loginRole.Id, permission.Id)
                {
                    Role = loginRole,
                    Permission = permission
                };
                loginRole.RolePermissions.Add(rolePermission);
            }

            UserRole userRole = new UserRole(Guid.NewGuid(), user.Id, loginRole.Id, null)
            {
                User = user,
                Role = loginRole
            };
            user.UserRoles.Add(userRole);

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

            int rowsAffected = await ExecuteNonQueryAsync(sql, parameters.ToArray());
            return rowsAffected > 0;
        }

        /// <summary>
        /// Optimized update for last login time only
        /// Uses raw SQL for maximum performance
        /// </summary>
        public async Task<bool> UpdateLastLoginAsync(Guid id, DateTime? lastLoginAt)
        {
            int rowsAffected = await ExecuteNonQueryAsync(
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
