using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.DomainEvents;
using PhysioBoo.Infrastructure.Configuration.EventSourcing;

namespace PhysioBoo.Infrastructure.Database
{
    public class EventStoreDbContext : DbContext
    {
        public virtual DbSet<StoredDomainEvent> StoredDomainEvents { get; set; } = null!;

        public EventStoreDbContext(DbContextOptions<EventStoreDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new StoredDomainEventConfiguration());

            base.OnModelCreating(modelBuilder);
        }
    }
}
