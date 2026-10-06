using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicationAdministrationConfiguration : IEntityTypeConfiguration<MedicationAdministration>
    {
        public void Configure(EntityTypeBuilder<MedicationAdministration> builder)
        {
            // Naming
            builder.ToTable("MedicationAdministrations");

            // PK
            builder.HasKey(m => m.Id);

            // Indexes
            builder.HasIndex(m => new { m.PatientId, m.ScheduledAt });
            builder.HasIndex(m => new { m.Status, m.ScheduledAt });

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(m => m.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(m => m.PatientId)
                   .IsRequired();

            builder.Property(m => m.MedicationName)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(m => m.Dose)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(m => m.Route)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(m => m.Frequency)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(m => m.ScheduledAt)
                   .IsRequired();

            builder.Property(m => m.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(m => m.AdministeredAt);

            builder.Property(m => m.AdministeredByName)
                   .HasMaxLength(120);

            builder.Property(m => m.Notes)
                   .HasMaxLength(1000);
        }
    }
}
