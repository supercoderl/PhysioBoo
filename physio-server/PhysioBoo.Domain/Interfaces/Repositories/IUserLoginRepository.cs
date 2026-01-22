using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IUserLoginRepository : IRepository<UserLogin>
    {
        Task<UserLogin?> FindByLoginProviderAndKey(string loginProvider, string key);
    }
}
