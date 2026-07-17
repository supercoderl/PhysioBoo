namespace PhysioBoo.Infrastructure.Caching
{
    public sealed class CacheOptions
    {
        public const string SectionName = "Cache";
        public int DefaultExpiryMinutes { get; init; } = 10;
    }
}
