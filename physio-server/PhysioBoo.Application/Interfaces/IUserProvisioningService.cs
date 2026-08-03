using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Interfaces
{
    public interface IUserProvisioningService
    {
        public Task<User> BuildAsync(Guid id, CreateUserViewModel user, Profile? profile = null, Guid? assignedBy = null);
    }
}
