namespace PhysioBoo.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        public Task<bool> CommitAsync();
        public Task BeginTransactionAsync(CancellationToken ct = default);
        public Task CommitTransactionAsync(CancellationToken ct = default);
        public Task RollbackTransactionAsync(CancellationToken ct = default);

        /// <summary>
        /// Runs <paramref name="work"/> inside the database execution strategy. Required around any
        /// <see cref="BeginTransactionAsync"/>: the DbContext retries transient failures, and EF rejects user
        /// transactions that are not started from inside the strategy. The work may be run again after a
        /// transient failure, so it must not have side effects outside the database.
        /// </summary>
        public Task ExecuteInStrategyAsync(Func<Task> work);
    }
}
