using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorEducationConfiguration : IEntityTypeConfiguration<DoctorEducation>
    {
        public void Configure(EntityTypeBuilder<DoctorEducation> builder)
        {
            // PK
            builder.HasKey(e => e.Id);

            // Indexes
            builder.HasIndex(e => e.DoctorId);

            // Relationships
            builder.HasOne(e => e.Doctor)
                   .WithMany(d => d.Educations)
                   .HasForeignKey(e => e.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(e => e.DegreeType)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(e => e.DegreeName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(e => e.Specialization)
                   .HasMaxLength(255);

            builder.Property(e => e.InstitutionName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(e => e.UniversityName)
                   .HasMaxLength(255);

            builder.Property(e => e.Location)
                   .HasMaxLength(255);

            builder.Property(e => e.Country)
                   .HasMaxLength(100);

            builder.Property(e => e.StartDate);
            builder.Property(e => e.CompletionDate);

            builder.Property(e => e.DurationYears)
                   .HasColumnType("numeric(3,2)");

            builder.Property(e => e.GradePercentage)
                   .HasColumnType("numeric(5,2)");

            builder.Property(e => e.GradeGPA)
                   .HasColumnType("numeric(3,2)");

            builder.Property(e => e.GradeClass)
                   .HasMaxLength(50);

            builder.Property(e => e.ThesisTitle);

            builder.Property(e => e.ThesisGuide)
                   .HasMaxLength(255);

            builder.Property(e => e.IsVerified)
                   .IsRequired();

            builder.Property(e => e.VerificationDocumentUrl)
                   .HasMaxLength(500);

            builder.Property(e => e.CreatedAt)
                   .IsRequired();
        }
    }
}
