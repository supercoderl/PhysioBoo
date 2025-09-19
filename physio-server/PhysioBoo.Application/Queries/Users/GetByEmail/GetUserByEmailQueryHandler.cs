using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Data;
using System.Text;

namespace PhysioBoo.Application.Queries.Users.GetByEmail
{
    public sealed class GetUserByEmailQueryHandler : IRequestHandler<GetUserByEmailQuery, User?>
    {
        private readonly IUserRepository _userRepository;
        private readonly IMediatorHandler _bus;

        public GetUserByEmailQueryHandler(IUserRepository userRepository, IMediatorHandler bus)
        {
            _userRepository = userRepository;
            _bus = bus;
        }

        public async Task<User?> Handle(GetUserByEmailQuery request, CancellationToken cancellationToken)
        {
            var parameters = new Dictionary<string, object>
            {
                ["p_email"] = request.Email
            };

            var result = await _userRepository.ExecutePostgresFunctionAsync<User>(
                "get_users_dynamic",
                parameters,
                reader =>
                {
                    var user = new Domain.Entities.Core.User(
                        reader.GetFieldValue<Guid>("Id"),
                        reader.GetString("Email"),
                        reader.GetString("Phone"),
                        reader.GetString("PasswordHash"),
                        Enum.Parse<Role>(reader.GetString("Role")),
                        !reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? reader.GetFieldValue<Guid>("CreatedBy") : (Guid?)null
                    );

                    user.SetAlternatePhone(reader.IsDBNull(reader.GetOrdinal("AlternatePhone")) ? null : reader.GetString("AlternatePhone"));
                    user.SetIsActive(reader.GetBoolean("IsActive"));
                    user.SetIsVerified(reader.GetBoolean("IsVerified"));
                    user.SetEmailVerifiedAt(reader.IsDBNull(reader.GetOrdinal("EmailVerifiedAt")) ? null : reader.GetDateTime("EmailVerifiedAt"));
                    user.SetPhoneVerifiedAt(reader.IsDBNull(reader.GetOrdinal("PhoneVerifiedAt")) ? null : reader.GetDateTime("PhoneVerifiedAt"));
                    user.SetLastLoginAt(reader.IsDBNull(reader.GetOrdinal("LastLoginAt")) ? null : reader.GetDateTime("LastLoginAt"));
                    user.SetFailedLoginAttempts(reader.GetInt32("FailedLoginAttempts"));
                    user.SetAccountLockedUntil(reader.IsDBNull(reader.GetOrdinal("AccountLockedUntil")) ? null : reader.GetDateTime("AccountLockedUntil"));
                    user.SetTwoFactorEnabled(reader.GetBoolean("TwoFactorEnabled"));
                    user.SetTwoFactorSecret(reader.IsDBNull(reader.GetOrdinal("TwoFactorSecret")) ? null : reader.GetString("TwoFactorSecret"));
                    user.SetProfilePicture(reader.IsDBNull(reader.GetOrdinal("ProfilePicture")) ? null : reader.GetString("ProfilePicture"));
                    user.SetPreferredLanguage(reader.GetString("PreferredLanguage"));
                    user.SetTimeZone(reader.GetString("TimeZone"));
                    user.SetCreatedAt(reader.GetDateTime("CreatedAt"));
                    user.SetCreatedBy(reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? null : reader.GetGuid("CreatedBy"));
                    user.SetUpdatedAt(reader.IsDBNull(reader.GetOrdinal("UpdatedAt")) ? null : reader.GetDateTime("UpdatedAt"));
                    user.SetUpdatedBy(reader.IsDBNull(reader.GetOrdinal("UpdatedBy")) ? null : reader.GetGuid("UpdatedBy"));

                    return user;
                }
            );

            return result.FirstOrDefault();
        }
    }
}
