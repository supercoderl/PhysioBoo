using PhysioBoo.Shared.Users;

namespace PhysioBoo.gRPC.Interfaces
{
    public interface IUsersContext
    {
        Task<IEnumerable<UserViewModel>> GetUsersByIds(IEnumerable<Guid> ids);
    }
}
