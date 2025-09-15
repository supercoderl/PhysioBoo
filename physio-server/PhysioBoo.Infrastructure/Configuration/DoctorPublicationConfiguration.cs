using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorPublicationConfiguration : IEntityTypeConfiguration<DoctorPublication>
    {
        public void Configure(EntityTypeBuilder<DoctorPublication> builder)
        {
            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => p.DoctorId);
            builder.HasIndex(p => p.Doi).IsUnique(false);
            builder.HasIndex(p => p.Pmid).IsUnique(false);

            // Relationships
            builder.HasOne(p => p.Doctor)
                   .WithMany(d => d.Publications)
                   .HasForeignKey(p => p.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(p => p.Title)
                   .IsRequired();

            builder.Property(p => p.PublicationType)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(p => p.JournalName)
                   .HasMaxLength(255);

            builder.Property(p => p.ConferenceName)
                   .HasMaxLength(255);

            builder.Property(p => p.Publisher)
                   .HasMaxLength(255);

            builder.Property(p => p.PublicationDate);

            builder.Property(p => p.Volume).HasMaxLength(20);
            builder.Property(p => p.Issue).HasMaxLength(20);
            builder.Property(p => p.Pages).HasMaxLength(50);

            builder.Property(p => p.Doi).HasMaxLength(100);
            builder.Property(p => p.Pmid).HasMaxLength(20);
            builder.Property(p => p.Isbm).HasMaxLength(20);

            builder.Property(p => p.ImpactFactor)
                   .HasColumnType("numeric(5,3)");

            builder.Property(p => p.CitationCount).IsRequired();

            builder.Property(p => p.CoAuthors);

            builder.Property(p => p.Abstract);

            builder.Property(p => p.Keywords)
                   .HasColumnType("text[]");

            builder.Property(p => p.IsPeerReviewed)
                   .IsRequired();

            builder.Property(p => p.PublicationUrl)
                   .HasMaxLength(500);

            builder.Property(p => p.PdfUrl)
                   .HasMaxLength(500);

            builder.Property(p => p.CreatedAt)
                   .IsRequired();
        }
    }
}
