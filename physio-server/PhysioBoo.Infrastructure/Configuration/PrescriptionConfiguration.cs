using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
    {
        public void Configure(EntityTypeBuilder<Prescription> builder)
        {
            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => p.PrescriptionNumber).IsUnique();
            builder.HasIndex(p => p.PatientId);
            builder.HasIndex(p => p.DoctorId);
            builder.HasIndex(p => p.AppoinmentId);
            builder.HasIndex(p => p.MedicalRecordId);
            builder.HasIndex(p => p.HospitalId);

            // Relationships
            builder.HasOne(p => p.Patient)
                   .WithMany(pt => pt.Prescriptions)
                   .HasForeignKey(p => p.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Doctor)
                   .WithMany(d => d.Prescriptions)
                   .HasForeignKey(p => p.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Appointment)
                   .WithMany(a => a.Prescriptions)
                   .HasForeignKey(p => p.AppoinmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.MedicalRecord)
                   .WithMany(mr => mr.Prescriptions)
                   .HasForeignKey(p => p.MedicalRecordId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Hospital)
                   .WithMany(h => h.Prescriptions)
                   .HasForeignKey(p => p.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(p => p.PrescriptionNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(p => p.PrescriptionDate).IsRequired();

            builder.Property(p => p.Diagnosis);

            builder.Property(p => p.Instructions);

            builder.Property(p => p.TotalAmount)
                   .HasColumnType("numeric(10,2)")
                   .IsRequired();

            builder.Property(p => p.Status)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(p => p.ValidUntil);

            builder.Property(p => p.RefillCount).IsRequired();
            builder.Property(p => p.MaxRefills).IsRequired();

            builder.Property(p => p.IsDigital).IsRequired();
            builder.Property(p => p.IsPrinted).IsRequired();

            builder.Property(p => p.PharmacistNotes);

            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.UpdatedAt);
        }
    }
}
