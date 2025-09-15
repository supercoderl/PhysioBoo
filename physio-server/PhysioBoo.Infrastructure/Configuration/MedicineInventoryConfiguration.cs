using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicineInventoryConfiguration : IEntityTypeConfiguration<MedicineInventory>
    {
        public void Configure(EntityTypeBuilder<MedicineInventory> builder)
        {
            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.MedicineId);
            builder.HasIndex(i => i.HospitalId);
            builder.HasIndex(i => i.SupplierId);
            builder.HasIndex(i => new { i.MedicineId, i.HospitalId, i.BatchNumber }).IsUnique(false);

            // Relationships
            builder.HasOne(i => i.Medicine)
                   .WithMany(m => m.MedicineInventories)
                   .HasForeignKey(i => i.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Hospital)
                   .WithMany(h => h.MedicineInventories)
                   .HasForeignKey(i => i.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Supplier)
                   .WithMany(s => s.MedicineInventories)
                   .HasForeignKey(i => i.SupplierId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(i => i.BatchNumber)
                   .HasMaxLength(100);

            builder.Property(i => i.PurchaseDate);
            builder.Property(i => i.ExpiryDate);

            builder.Property(i => i.QuantityReceived).IsRequired();
            builder.Property(i => i.QuantityAvailable).IsRequired();
            builder.Property(i => i.QuantitySold).IsRequired();
            builder.Property(i => i.QuantityExpired).IsRequired();
            builder.Property(i => i.QuantityDamaged).IsRequired();

            builder.Property(i => i.UnitPurchasePrice)
                   .HasColumnType("numeric(10,2)");

            builder.Property(i => i.UnitSellingPrice)
                   .HasColumnType("numeric(10,2)");

            builder.Property(i => i.TotalPurchaseValue)
                   .HasColumnType("numeric(12,2)");

            builder.Property(i => i.StorageLocation)
                   .HasMaxLength(100);

            builder.Property(i => i.MinimumStockLevel).IsRequired();
            builder.Property(i => i.MaximumStockLevel).IsRequired();
            builder.Property(i => i.ReorderLevel).IsRequired();

            builder.Property(i => i.IsExpired).IsRequired();
            builder.Property(i => i.IsNearExpiry).IsRequired();

            builder.Property(i => i.LastUpdated);
            builder.Property(i => i.CreatedAt).IsRequired();
        }
    }
}
