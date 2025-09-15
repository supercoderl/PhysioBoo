using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorCertificationConfiguration : IEntityTypeConfiguration<DoctorCertification>
    {
        public void Configure(EntityTypeBuilder<DoctorCertification> builder)
        {
            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.DoctorId);

            // Relationships
            builder.HasOne(c => c.Doctor)
                   .WithMany(d => d.Certifications)
                   .HasForeignKey(c => c.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(c => c.CertificationName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.CertificationType)
                   .HasMaxLength(100);

            builder.Property(c => c.IssuingOrganization)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.CertificationNumber)
                   .HasMaxLength(100);

            builder.Property(c => c.IssueDate);
            builder.Property(c => c.ExpiryDate);

            builder.Property(c => c.IsLifetime)
                   .IsRequired();

            builder.Property(c => c.Status)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(c => c.VerificationUrl)
                   .HasMaxLength(500);

            builder.Property(c => c.CertificateDocumentUrl)
                   .HasMaxLength(500);

            builder.Property(c => c.CreatedAt)
                   .IsRequired();
        }
    }
}
