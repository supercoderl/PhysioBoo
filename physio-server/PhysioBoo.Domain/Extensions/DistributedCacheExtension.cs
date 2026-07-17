using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace PhysioBoo.Domain.Extensions
{
    public static class DistributedCacheExtension
    {
        public static readonly JsonSerializerSettings JsonSettings = new()
        {
            TypeNameHandling = TypeNameHandling.None,
            NullValueHandling = NullValueHandling.Ignore
        };

        public static async Task<T?> GetOrCreateJsonAsync<T>(
            this IDistributedCache cache,
            string key,
            Func<Task<T?>> factory,
            DistributedCacheEntryOptions options,
            CancellationToken cancellationToken = default)
        {
            string? json = await cache.GetStringAsync(key, cancellationToken);

            if (!string.IsNullOrWhiteSpace(json))
                return JsonConvert.DeserializeObject<T>(json, JsonSettings)!;

            T? value = await factory();

            if (value is null)
            {
                return value;
            }

            json = JsonConvert.SerializeObject(value, JsonSettings);

            await cache.SetStringAsync(key, json, options, cancellationToken);

            return value;
        }
    }
}
