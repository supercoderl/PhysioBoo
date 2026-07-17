namespace PhysioBoo.Application.Interfaces
{
    public interface ICacheRefreshGate
    {
        /// <summary>
        /// Runs refresh only if no refresh is already in progress for this key.
        /// Other concurrent calls for the same key are skipped, not queued.
        /// </summary>
        Task TryRefreshAsync(string key, Func<Task> refresh, CancellationToken cancellationToken = default);
    }
}
