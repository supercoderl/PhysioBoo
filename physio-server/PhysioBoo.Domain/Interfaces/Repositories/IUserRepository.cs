using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdentifierAsync(string identifier);
        Task<bool> UpdateUserFailedLoginAsync(Guid id, int failedLoginAttempts, DateTime? accountLockedUntil);
        Task<bool> UpdateLastLoginAsync(Guid id, DateTime? lastLoginAt);
    }
}
