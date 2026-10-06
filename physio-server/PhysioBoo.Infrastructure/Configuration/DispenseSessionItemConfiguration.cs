using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DispenseSessionItemConfiguration : IEntityTypeConfiguration<DispenseSessionItem>
    {
        public void Configure(EntityTypeBuilder<DispenseSessionItem> builder)
        {
            // Naming
            builder.ToTable("DispenseSessionItems");

            // PK (assigned in code; items are added through the change tracker)
            builder.HasKey(i => i.Id);
            builder.Property(i => i.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(i => new { i.SessionId, i.PrescriptionItemId }).IsUnique();
            builder.HasIndex(i => i.MedicineInventoryId);

            // Relationships
            builder.HasOne(i => i.PrescriptionItem)
                   .WithMany()
                   .HasForeignKey(i => i.PrescriptionItemId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(i => i.Medicine)
                   .WithMany()
                   .HasForeignKey(i => i.MedicineId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(i => i.MedicineInventory)
                   .WithMany()
                   .HasForeignKey(i => i.MedicineInventoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(i => i.ReplacementReason).HasMaxLength(500);

            builder.Property(i => i.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
