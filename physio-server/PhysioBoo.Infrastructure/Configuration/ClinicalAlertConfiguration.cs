using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ClinicalAlertConfiguration : IEntityTypeConfiguration<ClinicalAlert>
    {
        public void Configure(EntityTypeBuilder<ClinicalAlert> builder)
        {
            // Naming
            builder.ToTable("ClinicalAlerts");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => new { a.PatientId, a.IsAcknowledged });
            builder.HasIndex(a => new { a.IsAcknowledged, a.Severity });

            // Relationships
            builder.HasOne(a => a.Patient)
                   .WithMany()
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(a => a.PatientId)
                   .IsRequired();

            builder.Property(a => a.Type)
                   .HasConversion<string>()
                   .HasMaxLength(32)
                   .IsRequired();

            builder.Property(a => a.Severity)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.Message)
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
