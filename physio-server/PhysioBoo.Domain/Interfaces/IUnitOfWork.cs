namespace PhysioBoo.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        public Task<bool> CommitAsync();
        public Task BeginTransactionAsync(CancellationToken ct = default);
        public Task CommitTransactionAsync(CancellationToken ct = default);
        public Task RollbackTransactionAsync(CancellationToken ct = default);
    }
}
