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

        public Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
        {
            return _cache.GetOrCreateJsonAsync<T>(
                key,
                () => Task.FromResult<T?>(default),
                new DistributedCacheEntryOptions(),
                ct
            );
        }

        public Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null, CancellationToken ct = default)
        {
            // Delegates entirely to your existing extension
            return _cache.GetOrCreateJsonAsync(
                key,
                () => factory()!,
                BuildOptions(expiry),
                ct
            )!;
        }

        public Task RemoveAsync(string key, CancellationToken ct = default) => _cache.RemoveAsync(key, ct);

        public Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default)
        {
            string json = JsonConvert.SerializeObject(value, DistributedCacheExtension.JsonSettings);
            return _cache.SetStringAsync(key, json, BuildOptions(expiry), ct);
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
