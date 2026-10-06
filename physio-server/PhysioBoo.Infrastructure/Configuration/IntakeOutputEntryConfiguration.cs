using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class IntakeOutputEntryConfiguration : IEntityTypeConfiguration<IntakeOutputEntry>
    {
        public void Configure(EntityTypeBuilder<IntakeOutputEntry> builder)
        {
            // Naming
            builder.ToTable("IntakeOutputEntries");

            // PK
            builder.HasKey(e => e.Id);

            // Indexes
            builder.HasIndex(e => new { e.PatientId, e.RecordedAt });

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(e => e.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(e => e.PatientId)
                   .IsRequired();

            builder.Property(e => e.RecordedAt)
                   .IsRequired();

            builder.Property(e => e.RecordedByName)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(e => e.Direction)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(e => e.Category)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(e => e.VolumeMl)
                   .IsRequired();

            builder.Property(e => e.Notes)
                   .HasMaxLength(500);
        }
    }
}
