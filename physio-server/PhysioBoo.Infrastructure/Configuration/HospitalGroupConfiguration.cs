using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HospitalGroupConfiguration : IEntityTypeConfiguration<HospitalGroup>
    {
        public void Configure(EntityTypeBuilder<HospitalGroup> builder)
        {
            // PK
            builder.HasKey(hg => hg.Id);

            // Indexes
            builder.HasIndex(hg => hg.Name);

            // Properties
            builder.Property(hg => hg.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(hg => hg.Description);

            builder.Property(hg => hg.HeadquartersAddress);

            builder.Property(hg => hg.Website)
                   .HasMaxLength(255);

            builder.Property(hg => hg.Phone)
                   .HasMaxLength(20);

            builder.Property(hg => hg.Email)
                   .HasMaxLength(255);

            builder.Property(hg => hg.LogoUrl)
                   .HasMaxLength(500);

            builder.Property(hg => hg.EstablishedDate);

            builder.Property(hg => hg.LicenseNumber)
                   .HasMaxLength(100);

            // JSONB
            builder.Property(hg => hg.AccreditationDetails)
                   .HasColumnType("jsonb");

            builder.Property(hg => hg.IsActive)
                   .IsRequired();

            builder.Property(hg => hg.CreatedAt)
                   .IsRequired();

            builder.Property(hg => hg.UpdatedAt);
        }
    }
}
