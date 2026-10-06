using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SurgeryTimelineEventConfiguration : IEntityTypeConfiguration<SurgeryTimelineEvent>
    {
        public void Configure(EntityTypeBuilder<SurgeryTimelineEvent> builder)
        {
            // Naming
            builder.ToTable("SurgeryTimelineEvents");

            // PK
            builder.HasKey(e => e.Id);

            // Indexes
            // A case reaches each stage once.
            builder.HasIndex(e => new { e.SurgeryCaseId, e.Stage })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");

            // Relationships
            builder.HasOne(e => e.SurgeryCase)
                   .WithMany(c => c.Timeline)
                   .HasForeignKey(e => e.SurgeryCaseId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(e => e.Stage)
                   .HasConversion<string>()
                   .HasMaxLength(24)
                   .IsRequired();

            builder.Property(e => e.OccurredAt)
                   .IsRequired();
        }
    }
}
