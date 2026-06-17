using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IUserPreferenceRepository : IRepository<UserPreference>
    {
        Task<IReadOnlyList<UserPreference>> GetUserPreferencesByUserId(Guid userId);
        Task<bool> BulkUpsertUserPreferenceAsync(Guid userId, Guid tenantId, string json, DateTime createdAt, Guid? createdBy);
    }
}
