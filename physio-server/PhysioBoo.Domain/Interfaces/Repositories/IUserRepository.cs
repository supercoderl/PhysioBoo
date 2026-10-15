using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        /// <summary>
        /// Inserts the user together with the <see cref="User.UserRoles"/> attached to it. The generic
        /// <c>InsertAsync&lt;User&gt;</c> writes the user row only and silently drops the role link.
        /// </summary>
        Task<DbResult<Guid>> InsertWithRolesAsync(User user, CancellationToken ct = default);

        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdentifierAsync(string identifier);
        Task<bool> UpdateUserFailedLoginAsync(Guid id, int failedLoginAttempts, DateTime? accountLockedUntil);
        Task<bool> UpdateLastLoginAsync(Guid id, DateTime? lastLoginAt);
    }
}