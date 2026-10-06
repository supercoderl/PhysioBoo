using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class TreatmentOrderConfiguration : IEntityTypeConfiguration<TreatmentOrder>
    {
        public void Configure(EntityTypeBuilder<TreatmentOrder> builder)
        {
            // Naming
            builder.ToTable("TreatmentOrders");

            // PK
            builder.HasKey(o => o.Id);

            // Indexes
            builder.HasIndex(o => new { o.PatientId, o.StartTime });
            builder.HasIndex(o => new { o.PatientId, o.Status });

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(o => o.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(o => o.PatientId)
                   .IsRequired();

            builder.Property(o => o.OrderType)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(o => o.OrderName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(o => o.Priority)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(o => o.Frequency)
                   .HasMaxLength(64);

            builder.Property(o => o.StartTime)
                   .IsRequired();

            builder.Property(o => o.EndTime);

            builder.Property(o => o.OrderingDoctorName)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(o => o.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
