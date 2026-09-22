namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IMedicalServiceRepository : IRepository<MedicalService>
    {
        Task<MedicalService?> GetWithLinksAsync(Guid id, CancellationToken ct);
        Task<List<MedicalService>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct);
        Task<bool> CodeExistsAsync(string code, Guid? excludeId, CancellationToken ct);
    }
}
