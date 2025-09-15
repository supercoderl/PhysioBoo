using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
    {
        public void Configure(EntityTypeBuilder<Supplier> builder)
        {
            // PK
            builder.HasKey(s => s.Id);

            // Indexes
            builder.HasIndex(s => s.SupplierName);
            builder.HasIndex(s => s.SupplierCode).IsUnique(false);
            builder.HasIndex(s => s.Phone);
            builder.HasIndex(s => s.Email);

            // Properties
            builder.Property(s => s.SupplierName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(s => s.SupplierCode)
                   .HasMaxLength(50);

            builder.Property(s => s.Type)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(s => s.ContactPerson).HasMaxLength(255);
            builder.Property(s => s.Phone).HasMaxLength(20);
            builder.Property(s => s.AlternatePhone).HasMaxLength(20);
            builder.Property(s => s.Email).HasMaxLength(255);
            builder.Property(s => s.Website).HasMaxLength(255);

            builder.Property(s => s.Address)
                   .IsRequired();

            builder.Property(s => s.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.StateProvince)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.PostalCode).HasMaxLength(20);

            builder.Property(s => s.Country)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.BusinessRegistrationNumber).HasMaxLength(100);
            builder.Property(s => s.TaxIdentificationNumber).HasMaxLength(100);
            builder.Property(s => s.GstNumber).HasMaxLength(20);
            builder.Property(s => s.PanNumber).HasMaxLength(20);
            builder.Property(s => s.DrugLicenseNumber).HasMaxLength(100);
            builder.Property(s => s.DrugLicenseExpiry);
            builder.Property(s => s.FdaRegistrationNumber).HasMaxLength(100);
            builder.Property(s => s.IsoCertification).HasMaxLength(100);

            builder.Property(s => s.GmpCertified).IsRequired();

            builder.Property(s => s.PaymentTerms);
            builder.Property(s => s.CreditLimit)
                   .HasColumnType("numeric(15,2)")
                   .IsRequired();

            builder.Property(s => s.Currency)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(s => s.BankAccountDetails).HasColumnType("jsonb");

            builder.Property(s => s.LeadTimeDays).IsRequired();
            builder.Property(s => s.MinimumOrderValue).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(s => s.DeliveryReliabilityScore).HasColumnType("numeric(3,2)").IsRequired();
            builder.Property(s => s.QualityRating).HasColumnType("numeric(3,2)").IsRequired();
            builder.Property(s => s.ServiceRating).HasColumnType("numeric(3,2)").IsRequired();

            builder.Property(s => s.TotalOrders).IsRequired();
            builder.Property(s => s.TotalPurchaseValue).HasColumnType("numeric(15,2)").IsRequired();

            builder.Property(s => s.LastOrderDate);
            builder.Property(s => s.CreatedAt).IsRequired();
            builder.Property(s => s.UpdatedAt);
        }
    }
}
