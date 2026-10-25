using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>State of one generate request: the target tenant, the database and what has been created so far.</summary>
    internal sealed class DevDataContext
    {
        private readonly Dictionary<string, int> _created = new();
        private readonly List<string> _warnings = new();
        private readonly List<string> _reused = new();
        private HashSet<string>? _takenPhones;
        private string? _passwordHash;

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

        /// <summary>Keys of the modules whose rows already existed and were linked to instead of generated again.</summary>
        public IReadOnlyList<string> Reused => _reused;

        /// <summary>First eight hex digits of the tenant id: keeps generated codes unique across tenants.</summary>
        public string TenantCode => TenantId.ToString("N")[..8].ToUpperInvariant();

        /// <summary>The local "now" used to decide whether a generated appointment is past or upcoming.</summary>
        public DateTime Now { get; } = TimeZoneHelper.GetLocalTimeNow();

        public void Count(string key, int rows)
        {
            if (rows <= 0) return;
            _created[key] = _created.GetValueOrDefault(key) + rows;
        }

        public void Warn(string message) => _warnings.Add(message);

        public void Reuse(string key)
        {
            if (!_reused.Contains(key)) _reused.Add(key);
        }

        /// <summary>
        /// One password hash shared by every generated account. The password behind it is random and thrown away,
        /// so no generated account has a login anyone knows: the accounts exist to be linked to, not to sign in with.
        /// </summary>
        public string UnusablePasswordHash => _passwordHash ??= AuthHelper.HashPassword(Guid.NewGuid().ToString("N"));

        /// <summary>A phone number no user has yet (users.Phone is unique across all tenants).</summary>
        public async Task<string> UniquePhoneAsync(CancellationToken ct)
        {
            _takenPhones ??= (await Db.Users.IgnoreQueryFilters()
                .Where(u => u.Phone.StartsWith("+1 555"))
                .Select(u => u.Phone)
                .ToListAsync(ct)).ToHashSet();

            string phone;
            do
            {
                phone = Faker.Phone();
            }
            while (!_takenPhones.Add(phone));

            return phone;
        }

        /// <summary>Saves without the user-tenant stamping of <c>SaveChangesAsync</c>, which would overwrite <see cref="TenantId"/>.</summary>
        public Task SaveAsync(CancellationToken ct) => Db.SaveSeedChangesAsync(ct);
    }
}
