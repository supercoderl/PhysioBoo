using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorWorkExperienceConfiguration : IEntityTypeConfiguration<DoctorWorkExperience>
    {
        public void Configure(EntityTypeBuilder<DoctorWorkExperience> builder)
        {
            // Naming
            builder.ToTable("DoctorWorkExperiences");

            // PK
            builder.HasKey(w => w.Id);

            // Indexes
            builder.HasIndex(w => w.DoctorId);

            // Relationships
            builder.HasOne(w => w.Doctor)
                   .WithMany(d => d.WorkExperiences)
                   .HasForeignKey(w => w.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(w => w.Creator)
                   .WithMany(u => u.CreatedDoctorWorkExperiences)
                   .HasForeignKey(w => w.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.Updater)
                   .WithMany(u => u.UpdatedDoctorWorkExperiences)
                   .HasForeignKey(w => w.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.HospitalGroup)
                   .WithMany(hg => hg.DoctorWorkExperiences)
                   .HasForeignKey(w => w.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);
            // Properties
            builder.Property(w => w.PositionTitle)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(w => w.EmploymentType)
                   .HasConversion<string>()
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
        }
    }
}
