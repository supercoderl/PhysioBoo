using Npgsql;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class UserLoginRepository : BaseRepository<UserLogin>, IUserLoginRepository
    {
        public UserLoginRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<UserLogin?> FindByLoginProviderAndKey(string loginProvider, string key)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_provider"] = loginProvider,
                ["p_key"] = key
            };

            List<UserLogin> result = await ExecutePostgresFunctionAsync<UserLogin>(
                "get_by_provider_and_key",
                parameters,
                reader => MapProviderForLogin(reader)
            );

            return result.FirstOrDefault();
        }

        private static UserLogin MapProviderForLogin(NpgsqlDataReader reader)
        {
            UserLogin userLogin = new UserLogin(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("LoginProvider"),
                reader.GetString("ProviderKey"),
                reader.IsDBNull("ProviderDisplayName") ? null : reader.GetString("ProviderDisplayName"),
                reader.GetGuid("UserId")
            );

            return userLogin;
        }
    }
}
