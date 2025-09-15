using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LabReportConfiguration : IEntityTypeConfiguration<LabReport>
    {
        public void Configure(EntityTypeBuilder<LabReport> builder)
        {
            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.ReportNumber).IsUnique();
            builder.HasIndex(r => r.LabOrderId);
            builder.HasIndex(r => r.PatientId);
            builder.HasIndex(r => r.DoctorId);
            builder.HasIndex(r => r.PathologistId);
            builder.HasIndex(r => r.OriginalReportId);

            // Relationships
            builder.HasOne(r => r.LabOrder)
                   .WithMany(o => o.LabReports)
                   .HasForeignKey(r => r.LabOrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Patient)
                   .WithMany(p => p.LabReports)
                   .HasForeignKey(r => r.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Doctor)
                   .WithMany(d => d.LabReports)
                   .HasForeignKey(r => r.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Pathologist)
                   .WithMany(u => u.PathologistLabReports)
                   .HasForeignKey(r => r.PathologistId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.OriginalReport)
                   .WithMany(rp => rp.AmendedReports)
                   .HasForeignKey(r => r.OriginalReportId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(r => r.ReportNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(r => r.ReportDate).IsRequired();
            builder.Property(r => r.ReportTime).IsRequired();

            builder.Property(r => r.OverallImpression);
            builder.Property(r => r.ClinicalCorrelation);
            builder.Property(r => r.Recommendations);
            builder.Property(r => r.CriticalValues);

            builder.Property(r => r.PathologistSignature).HasMaxLength(500);

            builder.Property(r => r.IsFinal).IsRequired();
            builder.Property(r => r.IsAmended).IsRequired();
            builder.Property(r => r.AmendmentReason);

            builder.Property(r => r.ReportPdfUrl).HasMaxLength(500);

            builder.Property(r => r.DeliveredToPatient).IsRequired();
            builder.Property(r => r.DeliveredAt);
            builder.Property(r => r.DeliveryMethod).HasMaxLength(30);

            builder.Property(r => r.CreatedAt).IsRequired();
        }
    }
}
