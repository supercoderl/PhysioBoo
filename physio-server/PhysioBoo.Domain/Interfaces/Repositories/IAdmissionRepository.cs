using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IAdmissionRepository : IRepository<Admission>
    {
        // Loads Patient -> Profile, Department and Doctor -> User -> Profile (gotcha 4).
        Task<Admission?> GetWithLinksAsync(Guid id, CancellationToken ct = default);
    }
}
