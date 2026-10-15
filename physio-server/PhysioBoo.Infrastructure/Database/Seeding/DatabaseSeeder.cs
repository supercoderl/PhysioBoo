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
        private readonly EventStoreDbContext _eventStoreContext;
        private readonly DomainNotificationStoreDbContext _notificationStoreContext;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(
            ApplicationDbContext context,
            EventStoreDbContext eventStoreContext,
            DomainNotificationStoreDbContext notificationStoreContext,
            ILogger<DatabaseSeeder> logger
        )
        {
            _context = context;
            _eventStoreContext = eventStoreContext;
            _notificationStoreContext = notificationStoreContext;
            _logger = logger;
        }

        public async Task MigrateAsync(CancellationToken ct = default)
        {
            // The event store and the notification store are separate contexts on the same database.
            // Commands write to both, so a database missing either one fails on the first command.
            await _context.Database.MigrateAsync(ct);
            await _eventStoreContext.Database.MigrateAsync(ct);
            await _notificationStoreContext.Database.MigrateAsync(ct);
            _logger.LogInformation("Database migrations applied.");
        }
    }
}
