using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Interfaces;

namespace PhysioBoo.Infrastructure.Caching
{
    public sealed class InMemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly CacheOptions _options;

        public InMemoryCacheService(IMemoryCache cache, IOptions<CacheOptions> options)
        {
            _cache = cache;
            _options = options.Value;
        }

        public Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
        {
            _cache.TryGetValue(key, out T? value);
            return Task.FromResult(value);
        }

        public Task<T> GetOrCreateAsync<T>(
            string key,
            Func<Task<T>> factory,
            TimeSpan? expiry = null,
            CancellationToken ct = default)
        {
            return _cache.GetOrCreateAsync(key, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow =
                    expiry ?? TimeSpan.FromMinutes(_options.DefaultExpiryMinutes);

                return await factory();
            })!;
        }

        public Task SetAsync<T>(
            string key,
            T value,
            TimeSpan? expiry = null,
            CancellationToken ct = default)
        {
            MemoryCacheEntryOptions options = new MemoryCacheEntryOptions();

            if (expiry.HasValue)
                options.AbsoluteExpirationRelativeToNow = expiry.Value;

            _cache.Set(key, value, options);
            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key, CancellationToken ct = default)
        {
            _cache.Remove(key);
            return Task.CompletedTask;
        }
    }
}
