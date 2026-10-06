using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SurgeryAlertConfiguration : IEntityTypeConfiguration<SurgeryAlert>
    {
        public void Configure(EntityTypeBuilder<SurgeryAlert> builder)
        {
            // Naming
            builder.ToTable("SurgeryAlerts");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => new { a.IsAcknowledged, a.Severity });
            builder.HasIndex(a => new { a.SurgeryCaseId, a.Type });

            // Relationships
            builder.HasOne(a => a.SurgeryCase)
                   .WithMany()
                   .HasForeignKey(a => a.SurgeryCaseId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Patient)
                   .WithMany()
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(a => a.Type)
                   .HasConversion<string>()
                   .HasMaxLength(32)
                   .IsRequired();

            builder.Property(a => a.Severity)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.Description)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.SuggestedAction)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.RaisedAt)
                   .IsRequired();

            builder.Property(a => a.IsAcknowledged)
                   .IsRequired();

            builder.Property(a => a.AcknowledgedAt);

            builder.Property(a => a.AcknowledgedByName)
                   .HasMaxLength(120);

            builder.Property(a => a.AcknowledgeNote)
                   .HasMaxLength(500);
        }
    }
}
