

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IHospitalRepository : IRepository<Hospital>
    {
        /// <summary>
        /// Number of hospitals per hospital group. Ignores the tenant filter on purpose: it is used by the
        /// platform (Super Admin) views, which look across tenants.
        /// </summary>
        Task<Dictionary<Guid, int>> CountByHospitalGroupAsync(IReadOnlyCollection<Guid> hospitalGroupIds, CancellationToken ct = default);
    }
}
