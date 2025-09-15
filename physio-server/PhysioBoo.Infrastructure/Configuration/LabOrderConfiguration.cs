using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LabOrderConfiguration : IEntityTypeConfiguration<LabOrder>
    {
        public void Configure(EntityTypeBuilder<LabOrder> builder)
        {
            // PK
            builder.HasKey(o => o.Id);

            // Indexes
            builder.HasIndex(o => o.OrderNumber).IsUnique();
            builder.HasIndex(o => o.PatientId);
            builder.HasIndex(o => o.DoctorId);
            builder.HasIndex(o => o.AppointmentId);
            builder.HasIndex(o => o.HospitalId);

            // Relationships
            builder.HasOne(o => o.Patient)
                   .WithMany(p => p.LabOrders)
                   .HasForeignKey(o => o.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Doctor)
                   .WithMany(d => d.LabOrders)
                   .HasForeignKey(o => o.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Appointment)
                   .WithMany(a => a.LabOrders)
                   .HasForeignKey(o => o.AppointmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Hospital)
                   .WithMany(h => h.LabOrders)
                   .HasForeignKey(o => o.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Creator)
                   .WithMany(u => u.CreatedLabOrders)
                   .HasForeignKey(o => o.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(o => o.OrderNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(o => o.OrderDate).IsRequired();
            builder.Property(o => o.OrderTime).IsRequired();

            builder.Property(o => o.ClinicalHistory);
            builder.Property(o => o.PrivisionalDiagnosis);

            builder.Property(o => o.LabPriority)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(o => o.CollectionType)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(o => o.CollectionDate);
            builder.Property(o => o.CollectionTime);
            builder.Property(o => o.CollectionAddress).HasMaxLength(500);
            builder.Property(o => o.SpecialInstructions);

            builder.Property(o => o.TotalAmount)
                   .HasColumnType("numeric(10,2)")
                   .IsRequired();

            builder.Property(o => o.DiscountAmount)
                   .HasColumnType("numeric(10,2)")
                   .IsRequired();

            builder.Property(o => o.FinalAmount)
                   .HasColumnType("numeric(10,2)")
                   .IsRequired();

            builder.Property(o => o.PaymentStatus)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(o => o.OrderStatus)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(o => o.ReportDeliveryMethod)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(o => o.CreatedAt).IsRequired();
            builder.Property(o => o.UpdatedAt);
        }
    }
}
