using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ManufacturerConfiguration : IEntityTypeConfiguration<Manufacturer>
    {
        public void Configure(EntityTypeBuilder<Manufacturer> builder)
        {
            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.Name);
            builder.HasIndex(c => c.CompanyCode).IsUnique(false);

            // Properties
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.CompanyCode)
                   .HasMaxLength(20);

            builder.Property(c => c.Address);
            builder.Property(c => c.City).HasMaxLength(100);
            builder.Property(c => c.State).HasMaxLength(100);
            builder.Property(c => c.Country).HasMaxLength(100);
            builder.Property(c => c.PostalCode).HasMaxLength(20);

            builder.Property(c => c.Phone).HasMaxLength(20);
            builder.Property(c => c.Email).HasMaxLength(255);
            builder.Property(c => c.Website).HasMaxLength(255);

            builder.Property(c => c.LicenseNumber).HasMaxLength(100);

            builder.Property(c => c.GmpCertified).IsRequired();
            builder.Property(c => c.IsoCertified).IsRequired();
            builder.Property(c => c.FdaApproved).IsRequired();

            builder.Property(c => c.EstablishedYear).IsRequired();

            builder.Property(c => c.IsActive).IsRequired();

            builder.Property(c => c.CreatedAt).IsRequired();
        }
    }
}
