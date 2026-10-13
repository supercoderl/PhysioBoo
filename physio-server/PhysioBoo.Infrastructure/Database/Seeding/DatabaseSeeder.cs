using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Interfaces.Seeding;

namespace PhysioBoo.Infrastructure.Database.Seeding
{
    /// <summary>
    /// Applies the EF migrations. Reference data is plain SQL, run with psql after the migrations:
    /// Database/Seeding/Sql/seed-data.sql (roles, admin, permissions, menus, plans, sequence rules)
    /// and Database/Seeding/Sql/seed-geography.sql (countries, cities, districts, wards).
    /// </summary>
    public class DatabaseSeeder : IDatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(
            ApplicationDbContext context,
            ILogger<DatabaseSeeder> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        public async Task MigrateAsync(CancellationToken ct = default)
        {
            await _context.Database.MigrateAsync(ct);
            _logger.LogInformation("Database migrations applied.");
        }
    }
}
