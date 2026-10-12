namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>State of one generate request: the target tenant, the database and what has been created so far.</summary>
    internal sealed class DevDataContext
    {
        private readonly Dictionary<string, int> _created = new();
        private readonly List<string> _warnings = new();

        public DevDataContext(ApplicationDbContext db, Guid tenantId, Random random)
        {
            Db = db;
            TenantId = tenantId;
            Faker = new DevDataFaker(random);
        }

        public ApplicationDbContext Db { get; }

        /// <summary>The hospital group (tenant) every generated row belongs to. It is NOT the logged-in user's tenant.</summary>
        public Guid TenantId { get; }

        public DevDataFaker Faker { get; }

        public IReadOnlyDictionary<string, int> Created => _created;

        public IReadOnlyList<string> Warnings => _warnings;

        public void Count(string key, int rows)
        {
            if (rows <= 0) return;
            _created[key] = _created.GetValueOrDefault(key) + rows;
        }

        public void Warn(string message) => _warnings.Add(message);

        /// <summary>Saves without the user-tenant stamping of <c>SaveChangesAsync</c>, which would overwrite <see cref="TenantId"/>.</summary>
        public Task SaveAsync(CancellationToken ct) => Db.SaveSeedChangesAsync(ct);
    }
}
