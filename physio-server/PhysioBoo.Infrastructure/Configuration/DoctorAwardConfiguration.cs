using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorAwardConfiguration : IEntityTypeConfiguration<DoctorAward>
    {
        public void Configure(EntityTypeBuilder<DoctorAward> builder)
        {
            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => a.DoctorId);

            // Relationships
            builder.HasOne(a => a.Doctor)
                   .WithMany(d => d.Awards)
                   .HasForeignKey(a => a.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(a => a.AwardName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(a => a.AwardCategory)
                   .HasMaxLength(100);

            builder.Property(a => a.AwardingOrganization)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(a => a.AwardLevel)
                   .HasMaxLength(50);

            builder.Property(a => a.AwardDate);

            builder.Property(a => a.AwardYear);

            builder.Property(a => a.Description);

            builder.Property(a => a.MonetaryValue)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.CertificateUrl)
                   .HasMaxLength(500);

            builder.Property(a => a.MediaCoverageUrl)
                   .HasMaxLength(500);

            builder.Property(a => a.CreatedAt)
                   .IsRequired();
        }
    }
}
