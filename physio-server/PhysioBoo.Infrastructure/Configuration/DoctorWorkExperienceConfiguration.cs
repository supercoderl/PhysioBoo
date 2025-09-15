using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorWorkExperienceConfiguration : IEntityTypeConfiguration<DoctorWorkExperience>
    {
        public void Configure(EntityTypeBuilder<DoctorWorkExperience> builder)
        {
            // PK
            builder.HasKey(w => w.Id);

            // Indexes
            builder.HasIndex(w => w.DoctorId);

            // Relationships
            builder.HasOne(w => w.Doctor)
                   .WithMany(d => d.WorkExperiences)
                   .HasForeignKey(w => w.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(w => w.PositionTitle)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(w => w.EmploymentType)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(w => w.OrganizationName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(w => w.OrganizationType)
                   .HasMaxLength(100);

            builder.Property(w => w.Department)
                   .HasMaxLength(255);

            builder.Property(w => w.Location)
                   .HasMaxLength(255);

            builder.Property(w => w.Country)
                   .HasMaxLength(100);

            builder.Property(w => w.StartDate)
                   .IsRequired();

            builder.Property(w => w.EndDate);

            builder.Property(w => w.IsCurrent)
                   .IsRequired();

            builder.Property(w => w.Responsibilities);

            builder.Property(w => w.Archievements);

            builder.Property(w => w.SalaryRange)
                   .HasMaxLength(50);

            builder.Property(w => w.ReasonForLeaving);

            builder.Property(w => w.SupervisorName)
                   .HasMaxLength(255);

            builder.Property(w => w.SupervisorContact)
                   .HasMaxLength(255);

            builder.Property(w => w.CreatedAt)
                   .IsRequired();
        }
    }
}
