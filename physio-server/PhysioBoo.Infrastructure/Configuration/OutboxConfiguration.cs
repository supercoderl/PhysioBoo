using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Infrastructure.Outbox;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class OutboxConfiguration : IEntityTypeConfiguration<OutboxMessage>
    {
        public void Configure(EntityTypeBuilder<OutboxMessage> builder)
        {
            // Naming
            builder.ToTable("Outboxes");

            // PK
            builder.HasKey(ob => ob.Id);

            // Indexes
            builder.HasIndex(ob => new { ob.ProcessedOn, ob.RetryCount });
            builder.HasIndex(ob => ob.OccurredOn);

            // Properties
            builder.Property(e => e.Type).IsRequired().HasMaxLength(255);
            builder.Property(e => e.Content).IsRequired();
            builder.Property(e => e.UserId).HasMaxLength(255);
        }
    }
}
