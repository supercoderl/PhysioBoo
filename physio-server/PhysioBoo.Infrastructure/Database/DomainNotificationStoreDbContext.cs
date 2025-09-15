using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.DomainNotifications;
using PhysioBoo.Infrastructure.Configuration.EventSourcing;

namespace PhysioBoo.Infrastructure.Database
{
    public partial class DomainNotificationStoreDbContext : DbContext
    {
        public virtual DbSet<StoredDomainNotification> StoredDomainNotifications { get; set; } = null!;

        public DomainNotificationStoreDbContext(DbContextOptions<DomainNotificationStoreDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new StoredDomainNotificationConfiguration());

            base.OnModelCreating(modelBuilder);
        }
    }
}
