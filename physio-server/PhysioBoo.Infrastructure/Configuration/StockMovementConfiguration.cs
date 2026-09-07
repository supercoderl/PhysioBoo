

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
    {
        public void Configure(EntityTypeBuilder<StockMovement> builder)
        {
            // Naming
            builder.ToTable("StockMovements");

            // PK
            builder.HasKey(m => m.Id);

            // Indexes
            builder.HasIndex(m => m.MedicineId);
            builder.HasIndex(m => m.MedicineInventoryId);
            builder.HasIndex(m => m.OccurredAt);

            // Relationships
            builder.HasOne(m => m.Medicine)
                   .WithMany(med => med.StockMovements)
                   .HasForeignKey(m => m.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.MedicineInventory)
                   .WithMany(i => i.StockMovements)
                   .HasForeignKey(m => m.MedicineInventoryId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(m => m.WarehouseZone)
                   .WithMany()
                   .HasForeignKey(m => m.WarehouseZoneId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(m => m.PerformedByUser)
                   .WithMany(u => u.PerformedStockMovements)
                   .HasForeignKey(m => m.PerformedBy)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Creator)
                   .WithMany(u => u.CreatedStockMovements)
                   .HasForeignKey(m => m.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(m => m.Updater)
                   .WithMany(u => u.UpdatedStockMovements)
                   .HasForeignKey(m => m.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(m => m.HospitalGroup)
                   .WithMany(hg => hg.StockMovements)
                   .HasForeignKey(m => m.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(m => m.Type)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(m => m.Quantity).IsRequired();
            builder.Property(m => m.OccurredAt).IsRequired();
            builder.Property(m => m.Reference).HasMaxLength(100);
            builder.Property(m => m.Note).HasMaxLength(1000);
        }
    }
}
