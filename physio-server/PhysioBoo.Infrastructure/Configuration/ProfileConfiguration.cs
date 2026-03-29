using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ProfileConfiguration : IEntityTypeConfiguration<Profile>
    {
        public void Configure(EntityTypeBuilder<Profile> builder)
        {
            // Naming
            builder.ToTable("Profiles");

            // PK
            builder.HasKey(p => p.Id);

            // Self-relationships
            builder.HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(p => p.Id);

            builder.HasOne(p => p.Creator)
                   .WithMany(u => u.CreatedProfiles)
                   .HasForeignKey(p => p.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(p => p.Updater)
                   .WithMany(u => u.UpdatedProfiles)
                   .HasForeignKey(p => p.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(p => p.HospitalGroup)
                   .WithMany(h => h.Profiles)
                   .HasForeignKey(p => p.TenantId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(p => new { p.FirstName, p.LastName });
            builder.HasIndex(p => p.IdentificationNumber).IsUnique(false);

            // Properties
            builder.Property(p => p.FirstName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(p => p.LastName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(p => p.MiddleName)
                   .HasMaxLength(100);

            builder.Property(p => p.DateOfBirth)
                   .IsRequired();

            builder.Property(p => p.Gender)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(p => p.BloodGroup)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(p => p.MaritalStatus)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(p => p.Nationality).HasMaxLength(100);

            builder.Property(p => p.IdentificationType).HasMaxLength(50);
            builder.Property(p => p.IdentificationNumber).HasMaxLength(100);
            builder.Property(p => p.IdentificationExpiry);

            builder.Property(p => p.EmergencyContactName).HasMaxLength(255);
            builder.Property(p => p.EmergencyContactPhone).HasMaxLength(20);
            builder.Property(p => p.EmergencyContactRelationship).HasMaxLength(50);

            builder.Property(p => p.PreferredCommunication)
                   .HasConversion<string>()
                   .IsRequired();
        }
    }
}
