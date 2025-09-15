using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> builder)
        {
            // PK
            builder.HasKey(m => m.Id);

            // Indexes
            builder.HasIndex(m => m.Name);
            builder.HasIndex(m => m.GenericName);
            builder.HasIndex(m => m.BrandName);
            builder.HasIndex(m => m.CategoryId);
            builder.HasIndex(m => m.ManufacturerId);
            builder.HasIndex(m => m.DrugCode).IsUnique(false);
            builder.HasIndex(m => m.Barcode).IsUnique(false);
            builder.HasIndex(m => m.QrCode).IsUnique(false);

            // Relationships
            builder.HasOne(m => m.Category)
                   .WithMany(c => c.Medicines)
                   .HasForeignKey(m => m.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.Manufacturer)
                   .WithMany(p => p.Medicines)
                   .HasForeignKey(m => m.ManufacturerId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(m => m.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(m => m.GenericName).HasMaxLength(255);
            builder.Property(m => m.BrandName).HasMaxLength(255);

            builder.Property(m => m.Composition);
            builder.Property(m => m.Strength).HasMaxLength(100);

            builder.Property(m => m.DosageForm)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(m => m.RouteOfAdministration).HasMaxLength(50);
            builder.Property(m => m.PackSize).HasMaxLength(50);

            builder.Property(m => m.Mrp).HasColumnType("numeric(10,2)");
            builder.Property(m => m.PurchasePrice).HasColumnType("numeric(10,2)");
            builder.Property(m => m.SellingPrice).HasColumnType("numeric(10,2)");

            builder.Property(m => m.DiscountPercentage)
                   .HasColumnType("numeric(5,2)")
                   .IsRequired();

            builder.Property(m => m.TaxPercentage)
                   .HasColumnType("numeric(5,2)")
                   .IsRequired();

            builder.Property(m => m.HsnCode).HasMaxLength(20);
            builder.Property(m => m.DrugCode).HasMaxLength(50);
            builder.Property(m => m.BatchNumber).HasMaxLength(100);

            builder.Property(m => m.ManufacturingDate);
            builder.Property(m => m.ExpiryDate);

            builder.Property(m => m.IsPrescriptionRequired).IsRequired();
            builder.Property(m => m.IsControlledSubstance).IsRequired();
            builder.Property(m => m.ControlledSubstanceSchedule).HasMaxLength(10);

            builder.Property(m => m.MinimumAge).IsRequired();
            builder.Property(m => m.MaximumAge);

            builder.Property(m => m.PregnancyCategory).HasMaxLength(10);

            builder.Property(m => m.StorageTemperatureMin);
            builder.Property(m => m.StorageTemperatureMax);
            builder.Property(m => m.StorageConditions);

            builder.Property(m => m.SideEffects);
            builder.Property(m => m.Contraindications);
            builder.Property(m => m.DrugInteractions);
            builder.Property(m => m.OverdoseSymptoms);
            builder.Property(m => m.UsageInstructions);

            builder.Property(m => m.WarningLabels)
                   .HasColumnType("text[]");

            builder.Property(m => m.Barcode).HasMaxLength(100);
            builder.Property(m => m.QrCode).HasMaxLength(500);
            builder.Property(m => m.ImageUrl).HasMaxLength(500);

            builder.Property(m => m.IsGeneric).IsRequired();
            builder.Property(m => m.IsBanned).IsRequired();
            builder.Property(m => m.BanReason);

            builder.Property(m => m.TherapeuticClass).HasMaxLength(255);
            builder.Property(m => m.PharmacologicalClass).HasMaxLength(255);

            builder.Property(m => m.ApprovalNumber).HasMaxLength(100);
            builder.Property(m => m.ApprovalDate);

            builder.Property(m => m.IsActive).IsRequired();
            builder.Property(m => m.CreatedAt).IsRequired();
            builder.Property(m => m.UpdatedAt);
        }
    }
}
