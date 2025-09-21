using Npgsql;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RefreshTokenRepository : BaseRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            var parameters = new Dictionary<string, object>
            {
                ["p_token"] = token
            };

            var result = await ExecutePostgresFunctionAsync<RefreshToken>(
                "get_refresh_tokens_dynamic",
                parameters,
                reader => MapRefreshToken(reader)
            );

            return result.FirstOrDefault();
        }

        private static RefreshToken MapRefreshToken(NpgsqlDataReader reader)
        {
            var refreshToken = new RefreshToken(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetGuid("UserId"),
                reader.GetString("Token"),
                reader.GetDateTime("ExpiresAt")
            );

            // Only set properties needed for login validation
            refreshToken.SetUser(new User(
                refreshToken.UserId,
                reader.IsDBNull("UserEmail") ? string.Empty : reader.GetString("UserEmail"),
                string.Empty,
                string.Empty,
                reader.IsDBNull("UserRole") ? Role.Patient : Enum.Parse<Role>(reader.GetString("UserRole")),
                null
            ));

            return refreshToken;
        }
    }
}
