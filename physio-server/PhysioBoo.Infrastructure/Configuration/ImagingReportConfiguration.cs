using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ImagingReportConfiguration : IEntityTypeConfiguration<ImagingReport>
    {
        public void Configure(EntityTypeBuilder<ImagingReport> builder)
        {
            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.ReportNumber).IsUnique();
            builder.HasIndex(r => r.ImagingOrderId);
            builder.HasIndex(r => r.PatientId);
            builder.HasIndex(r => r.RadiologistId);

            // Relationships
            builder.HasOne(r => r.ImagingOrder)
                   .WithMany(o => o.ImagingReports)
                   .HasForeignKey(r => r.ImagingOrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Patient)
                   .WithMany(p => p.ImagingReports)
                   .HasForeignKey(r => r.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Radiologist)
                   .WithMany(u => u.ImagingReports)
                   .HasForeignKey(r => r.RadiologistId);

            // Properties
            builder.Property(r => r.ReportNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(r => r.StudyDate).IsRequired();
            builder.Property(r => r.StudyTime).IsRequired();

            builder.Property(r => r.Technique);
            builder.Property(r => r.Findings);
            builder.Property(r => r.Impression);
            builder.Property(r => r.Recommendations);
            builder.Property(r => r.ComparisonStudies);
            builder.Property(r => r.Limitations);
            builder.Property(r => r.CriticalFindings);

            builder.Property(r => r.IsCritical).IsRequired();
            builder.Property(r => r.IsNormal).IsRequired();
            builder.Property(r => r.IsFinal).IsRequired();
            builder.Property(r => r.IsAmended).IsRequired();

            builder.Property(r => r.AmendmentReason);

            builder.Property(r => r.DictatedAt);
            builder.Property(r => r.TranscribedAt);
            builder.Property(r => r.VerifiedAt);

            builder.Property(r => r.Status)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(r => r.ImagesCount).IsRequired();

            builder.Property(r => r.DicomStudyUid)
                   .HasMaxLength(255);

            builder.Property(r => r.ReportPdfUrl)
                   .HasMaxLength(500);

            builder.Property(r => r.ImagesUrl).HasColumnType("jsonb");

            builder.Property(r => r.CreatedAt).IsRequired();
        }
    }
}
