using PhysioBoo.Domain.Entities;

namespace PhysioBoo.Domain
{
    public static class CacheKeyGenerator
    {
        public static string GetEntityCacheKey<TEntity>(TEntity entity) where TEntity : Entity
            => $"{typeof(TEntity)}-{entity.Id}";

        public static string GetEntityCacheKey<TEntity>(Guid id) where TEntity : Entity
            => $"{typeof(TEntity)}-{id}";
    }
}
