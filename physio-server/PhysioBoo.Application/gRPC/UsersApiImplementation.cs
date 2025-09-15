using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Proto.Users;

namespace PhysioBoo.Application.gRPC
{
    public sealed class UsersApiImplementation : UsersApi.UsersApiBase
    {
        private readonly IUserRepository _userRepository;

        public UsersApiImplementation(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public override async Task<GetUsersByIdsResult> GetByIds(
        GetUsersByIdsRequest request,
        ServerCallContext context)
        {
            var idsAsGuids = new List<Guid>(request.Ids.Count);

            foreach (var id in request.Ids)
            {
                if (Guid.TryParse(id, out var parsed))
                {
                    idsAsGuids.Add(parsed);
                }
            }

            var users = await _userRepository
                .GetAllNoTracking(
                    filter: u => idsAsGuids.Contains(u.Id)
                )
                .Select(user => new GrpcUser
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    Phone = user.Phone,
                    AlternatePhone = user.AlternatePhone == null ? "" : user.AlternatePhone,
                    DeletedAt = user.DeletedAt == null ? "" : user.DeletedAt.ToString()
                }).ToListAsync();

            var result = new GetUsersByIdsResult();

            result.Users.AddRange(users);

            return result;
        }
    }
}
