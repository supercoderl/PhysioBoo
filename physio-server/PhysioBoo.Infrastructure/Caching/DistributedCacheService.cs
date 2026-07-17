using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Extensions;

namespace PhysioBoo.Infrastructure.Caching
{
    public sealed class DistributedCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private readonly CacheOptions _options;

        public DistributedCacheService(IDistributedCache cache, IOptions<CacheOptions> options)
        {
            _cache = cache;
            _options = options.Value;
        }

        public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            return _cache.GetOrCreateJsonAsync<T>(
                key,
                () => Task.FromResult<T?>(default),
                new DistributedCacheEntryOptions(),
                cancellationToken
            );
        }

        public Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
        {
            // Delegates entirely to your existing extension
            return _cache.GetOrCreateJsonAsync(
                key,
                () => factory()!,
                BuildOptions(expiry),
                cancellationToken
            )!;
        }

        public Task RemoveAsync(string key, CancellationToken cancellationToken = default) => _cache.RemoveAsync(key, cancellationToken);

        public Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
        {
            string json = JsonConvert.SerializeObject(value, DistributedCacheExtension.JsonSettings);
            return _cache.SetStringAsync(key, json, BuildOptions(expiry), cancellationToken);
        }

        private DistributedCacheEntryOptions BuildOptions(TimeSpan? expiry)
        {
            DistributedCacheEntryOptions options = new DistributedCacheEntryOptions();

            if (expiry.HasValue)
                options.AbsoluteExpirationRelativeToNow = expiry.Value;

            return options;
        }
    }
}
