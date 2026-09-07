

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class StockTakeItemConfiguration : IEntityTypeConfiguration<StockTakeItem>
    {
        public void Configure(EntityTypeBuilder<StockTakeItem> builder)
        {
            // Naming
            builder.ToTable("StockTakeItems");

            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.StockTakeId);
            builder.HasIndex(i => i.MedicineInventoryId);

            // Relationships
            builder.HasOne(i => i.StockTake)
                   .WithMany(s => s.StockTakeItems)
                   .HasForeignKey(i => i.StockTakeId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.MedicineInventory)
                   .WithMany(mi => mi.StockTakeItems)
                   .HasForeignKey(i => i.MedicineInventoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(i => i.Creator)
                   .WithMany(u => u.CreatedStockTakeItems)
                   .HasForeignKey(i => i.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.Updater)
                   .WithMany(u => u.UpdatedStockTakeItems)
                   .HasForeignKey(i => i.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.HospitalGroup)
                   .WithMany(hg => hg.StockTakeItems)
                   .HasForeignKey(i => i.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(i => i.SystemQty).IsRequired();
            builder.Property(i => i.Reason).HasMaxLength(50);
            builder.Property(i => i.Notes).HasMaxLength(1000);
            builder.Property(i => i.IsCounted).IsRequired();
        }
    }
}
