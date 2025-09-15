using PhysioBoo.gRPC.Interfaces;
using PhysioBoo.Proto.Users;
using PhysioBoo.Shared.Users;

namespace PhysioBoo.gRPC.Contexts
{
    public sealed class UsersContext : IUsersContext
    {
        private readonly UsersApi.UsersApiClient _client;

        public UsersContext(UsersApi.UsersApiClient client)
        {
            _client = client;
        }

        public async Task<IEnumerable<UserViewModel>> GetUsersByIds(IEnumerable<Guid> ids)
        {
            var request = new GetUsersByIdsRequest();

            request.Ids.AddRange(ids.Select(id => id.ToString()));

            var result = await _client.GetByIdsAsync(request);

            return result.Users.Select(user => new UserViewModel(
                Guid.Parse(user.Id),
                user.Email,
                user.Phone,
                string.IsNullOrEmpty(user.AlternatePhone) ? null : user.AlternatePhone,
                string.IsNullOrWhiteSpace(user.DeletedAt) ? null : DateTimeOffset.Parse(user.DeletedAt))
            );
        }
    }
}
