

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class InventoryAlertConfiguration : IEntityTypeConfiguration<InventoryAlert>
    {
        public void Configure(EntityTypeBuilder<InventoryAlert> builder)
        {
            // Naming
            builder.ToTable("InventoryAlerts");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => a.MedicineId);
            builder.HasIndex(a => a.Severity);

            // Relationships
            builder.HasOne(a => a.Medicine)
                   .WithMany(m => m.InventoryAlerts)
                   .HasForeignKey(a => a.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.AcknowledgedByUser)
                   .WithMany(u => u.AcknowledgedInventoryAlerts)
                   .HasForeignKey(a => a.AcknowledgedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Creator)
                   .WithMany(u => u.CreatedInventoryAlerts)
                   .HasForeignKey(a => a.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Updater)
                   .WithMany(u => u.UpdatedInventoryAlerts)
                   .HasForeignKey(a => a.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.HospitalGroup)
                   .WithMany(hg => hg.InventoryAlerts)
                   .HasForeignKey(a => a.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(a => a.Type)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.Severity)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.Message)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.Recommendation).HasMaxLength(500);
        }
    }
}
