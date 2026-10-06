using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class VitalSignConfiguration : IEntityTypeConfiguration<VitalSign>
    {
        public void Configure(EntityTypeBuilder<VitalSign> builder)
        {
            // Naming
            builder.ToTable("VitalSigns");

            // PK
            builder.HasKey(v => v.Id);

            // Indexes
            builder.HasIndex(v => new { v.PatientId, v.RecordedAt });

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(v => v.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(v => v.PatientId)
                   .IsRequired();

            builder.Property(v => v.RecordedAt)
                   .IsRequired();

            builder.Property(v => v.RecordedByName)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(v => v.BloodPressureSystolic);

            builder.Property(v => v.BloodPressureDiastolic);

            builder.Property(v => v.HeartRate);

            builder.Property(v => v.Temperature)
                   .HasPrecision(4, 1);

            builder.Property(v => v.RespiratoryRate);

            builder.Property(v => v.Spo2);

            builder.Property(v => v.IsAbnormal)
                   .IsRequired();
        }
    }
}
