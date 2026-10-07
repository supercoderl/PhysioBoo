namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IMedicalServiceRepository : IRepository<MedicalService>
    {
        Task<MedicalService?> GetWithLinksAsync(Guid id, CancellationToken ct);
        Task<List<MedicalService>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct);
        Task<bool> CodeExistsAsync(string code, Guid? excludeId, CancellationToken ct);

        // InsertAsync (Dapper) skips navigation collections, so join rows of a new service are saved here.
        Task SaveLinksAsync(Guid serviceId, IEnumerable<Guid> departmentIds, IEnumerable<Guid> doctorIds, CancellationToken ct);
    }
}
