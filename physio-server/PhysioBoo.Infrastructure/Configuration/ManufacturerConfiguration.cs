using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ManufacturerConfiguration : IEntityTypeConfiguration<Manufacturer>
    {
        public void Configure(EntityTypeBuilder<Manufacturer> builder)
        {
            // Naming
            builder.ToTable("Manufacturers");

            // PK
            builder.HasKey(m => m.Id);

            // Indexes
            builder.HasIndex(m => m.Name);
            builder.HasIndex(m => m.CompanyCode).IsUnique(false);

            // Properties
            builder.Property(m => m.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(m => m.CompanyCode)
                   .HasMaxLength(100);

            builder.Property(m => m.Address);
            builder.Property(m => m.City).HasMaxLength(100);
            builder.Property(m => m.State).HasMaxLength(100);
            builder.Property(m => m.Country).HasMaxLength(100);
            builder.Property(m => m.PostalCode).HasMaxLength(20);

            builder.Property(m => m.Phone).HasMaxLength(20);
            builder.Property(m => m.Email).HasMaxLength(255);
            builder.Property(m => m.Website).HasMaxLength(255);

            builder.Property(m => m.LicenseNumber).HasMaxLength(100);

            builder.Property(m => m.GmpCertified).IsRequired();
            builder.Property(m => m.IsoCertified).IsRequired();
            builder.Property(m => m.FdaApproved).IsRequired();

            builder.Property(m => m.EstablishedYear).IsRequired();

            builder.Property(m => m.IsActive).IsRequired();

            builder.Property(m => m.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"CompanyCode\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
