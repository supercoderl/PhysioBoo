using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            // Naming
            builder.ToTable("Addresses");

            // Primary key
            builder.HasKey(a => a.Id);

            // Relationships
            builder.HasOne(a => a.User)               // assuming Address belongs to a User
                   .WithMany(u => u.Addresses)   // navigation property in User entity
                   .HasForeignKey(a => a.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.HospitalGroup)
                        .WithMany(h => h.Addresses)
                        .HasForeignKey(a => a.TenantId)
                        .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Creator)
                   .WithMany(u => u.CreatedAddresses)
                   .HasForeignKey(a => a.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Updater)
                   .WithMany(u => u.UpdatedAddresses)
                   .HasForeignKey(a => a.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(a => a.Street)
                   .IsRequired();

            builder.Property(a => a.ApartmentUnit)
                   .HasMaxLength(50);

            builder.Property(a => a.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.StateProvince)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.PostalCode)
                   .HasMaxLength(20);

            builder.Property(a => a.Country)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.Latitude)
                   .HasColumnType("decimal(10,8)");

            builder.Property(a => a.Longitude)
                   .HasColumnType("decimal(11,8)");

            builder.Property(a => a.AddressType)
                   .IsRequired()
                   .HasConversion<string>();     // store enum as string

            builder.Property(a => a.IsPrimary)
                   .IsRequired();

            builder.Property(ms => ms.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Street\", '') || ' ' || coalesce(\"Country\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
