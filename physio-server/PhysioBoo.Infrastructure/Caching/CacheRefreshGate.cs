using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Interfaces;
using System.Collections.Concurrent;

namespace PhysioBoo.Infrastructure.Caching
{
    public sealed class CacheRefreshGate : ICacheRefreshGate
    {
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
        private readonly ILogger<CacheRefreshGate> _logger;

        public CacheRefreshGate(ILogger<CacheRefreshGate> logger) => _logger = logger;

        public async Task TryRefreshAsync(
            string key,
            Func<Task> refresh,
            CancellationToken cancellationToken = default)
        {
            SemaphoreSlim semaphore = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));

            if (!await semaphore.WaitAsync(TimeSpan.Zero, cancellationToken))
            {
                _logger.LogDebug("Cache refresh already in progress for key '{Key}', skipping.", key);
                return;
            }

            try
            {
                await refresh();
                _logger.LogDebug("Cache refreshed for key '{Key}'.", key);
            }
            finally
            {
                semaphore.Release();
            }
        }
    }
}
