using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HospitalConfiguration : IEntityTypeConfiguration<Hospital>
    {
        public void Configure(EntityTypeBuilder<Hospital> builder)
        {
            // PK
            builder.HasKey(h => h.Id);

            // Indexes
            builder.HasIndex(h => h.HospitalGroupId);
            builder.HasIndex(h => h.HospitalCode).IsUnique(false);
            builder.HasIndex(h => h.Name);

            // Relationships
            builder.HasOne(h => h.HospitalGroup)
                   .WithMany(g => g.Hospitals)
                   .HasForeignKey(h => h.HospitalGroupId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(h => h.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(h => h.HospitalCode)
                   .HasMaxLength(20);

            builder.Property(h => h.HospitalType)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(h => h.BedCapacity).IsRequired();
            builder.Property(h => h.IcuCapacity).IsRequired();
            builder.Property(h => h.EmergencyCapacity).IsRequired();
            builder.Property(h => h.OperationTheaters).IsRequired();

            builder.Property(h => h.Address)
                   .IsRequired();

            builder.Property(h => h.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(h => h.StateProvince)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(h => h.PostalCode).HasMaxLength(20);

            builder.Property(h => h.Country)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(h => h.Phone).HasMaxLength(20);
            builder.Property(h => h.Fax).HasMaxLength(20);
            builder.Property(h => h.Email).HasMaxLength(255);
            builder.Property(h => h.Website).HasMaxLength(255);
            builder.Property(h => h.EmergencyPhone).HasMaxLength(20);
            builder.Property(h => h.AmbulancePhone).HasMaxLength(20);

            builder.Property(h => h.Latitude)
                   .HasColumnType("numeric(10,8)");

            builder.Property(h => h.Longtitude)
                   .HasColumnType("numeric(11,8)");

            builder.Property(h => h.EstablishedDate);
            builder.Property(h => h.LicenseNumber).HasMaxLength(100);
            builder.Property(h => h.LicenseExpiry);

            builder.Property(h => h.AccreditationBody)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(h => h.AccreditationExpiry);

            // Arrays
            builder.Property(h => h.InsuranceAccepted)
                   .HasColumnType("text[]");

            builder.Property(h => h.LanguagesSupported)
                   .HasColumnType("text[]");

            // JSONB fields
            builder.Property(h => h.Facilities)
                   .HasColumnType("jsonb");

            builder.Property(h => h.OperatingHours)
                   .HasColumnType("jsonb");

            builder.Property(h => h.Images)
                   .HasColumnType("jsonb");

            builder.Property(h => h.Is24Hours).IsRequired();
            builder.Property(h => h.IsActive).IsRequired();

            builder.Property(h => h.LogoUrl).HasMaxLength(500);

            builder.Property(h => h.Description);
            builder.Property(h => h.MissionStatement);
            builder.Property(h => h.VisionStatement);

            builder.Property(h => h.CreatedAt).IsRequired();
            builder.Property(h => h.UpdatedAt);
        }
    }
}
