using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorSpecialityConfiguration : IEntityTypeConfiguration<DoctorSpecialty>
    {
        public void Configure(EntityTypeBuilder<DoctorSpecialty> builder)
        {
            // PK
            builder.HasKey(ds => ds.Id);

            // Indexes
            builder.HasIndex(ds => ds.DoctorId);
            builder.HasIndex(ds => ds.SpecialtyId);

            // Relationships
            builder.HasOne(ds => ds.Doctor)
                   .WithMany(d => d.Specialties)
                   .HasForeignKey(ds => ds.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ds => ds.Specialty)
                   .WithMany(s => s.DoctorSpecialties)
                   .HasForeignKey(ds => ds.SpecialtyId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(ds => ds.ProficiencyLevel)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(ds => ds.YearsOfExperience)
                   .IsRequired();

            builder.Property(ds => ds.CertificationNumber)
                   .HasMaxLength(100);

            builder.Property(ds => ds.CertificationDate);
            builder.Property(ds => ds.CertificationExpiry);

            builder.Property(ds => ds.IsPrimary)
                   .IsRequired();

            builder.Property(ds => ds.CreatedAt)
                   .IsRequired();
        }
    }
}
