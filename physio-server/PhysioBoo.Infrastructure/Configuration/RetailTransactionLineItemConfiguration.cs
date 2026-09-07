

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RetailTransactionLineItemConfiguration : IEntityTypeConfiguration<RetailTransactionLineItem>
    {
        public void Configure(EntityTypeBuilder<RetailTransactionLineItem> builder)
        {
            // Naming
            builder.ToTable("RetailTransactionLineItems");

            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.RetailTransactionId);
            builder.HasIndex(i => i.MedicineId);

            // Relationships
            builder.HasOne(i => i.RetailTransaction)
                   .WithMany(t => t.RetailTransactionLineItems)
                   .HasForeignKey(i => i.RetailTransactionId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Medicine)
                   .WithMany(m => m.RetailTransactionLineItems)
                   .HasForeignKey(i => i.MedicineId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(i => i.Creator)
                   .WithMany(u => u.CreatedRetailTransactionLineItems)
                   .HasForeignKey(i => i.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.Updater)
                   .WithMany(u => u.UpdatedRetailTransactionLineItems)
                   .HasForeignKey(i => i.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.HospitalGroup)
                   .WithMany(hg => hg.RetailTransactionLineItems)
                   .HasForeignKey(i => i.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(i => i.MedicineNameSnapshot)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(i => i.Quantity).IsRequired();
            builder.Property(i => i.UnitPriceSnapshot).HasColumnType("numeric(10,2)").IsRequired();
            builder.Property(i => i.DiscountPercent).HasColumnType("numeric(5,2)").IsRequired();
            builder.Property(i => i.InsuranceCoveredAmount).HasColumnType("numeric(10,2)").IsRequired();
            builder.Property(i => i.Total).HasColumnType("numeric(10,2)").IsRequired();
        }
    }
}
