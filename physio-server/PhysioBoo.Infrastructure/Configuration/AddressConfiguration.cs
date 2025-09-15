using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            // Primary key
            builder.HasKey(a => a.Id);

            // Relationships
            builder.HasOne(a => a.User)               // assuming Address belongs to a User
                   .WithMany(u => u.Addresses)   // navigation property in User entity
                   .HasForeignKey(a => a.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

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
                   .HasConversion<string>()     // store enum as string
                   .HasMaxLength(20);

            builder.Property(a => a.IsPrimary)
                   .IsRequired();

            builder.Property(a => a.CreatedAt)
                   .IsRequired();

            builder.Property(a => a.UpdatedAt)
                   .IsRequired(false);
        }
    }
}
