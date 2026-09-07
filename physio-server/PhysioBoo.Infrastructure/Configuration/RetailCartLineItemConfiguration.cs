

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RetailCartLineItemConfiguration : IEntityTypeConfiguration<RetailCartLineItem>
    {
        public void Configure(EntityTypeBuilder<RetailCartLineItem> builder)
        {
            // Naming
            builder.ToTable("RetailCartLineItems");

            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.RetailCartId);
            builder.HasIndex(i => i.MedicineId);

            // Relationships
            builder.HasOne(i => i.RetailCart)
                   .WithMany(c => c.RetailCartLineItems)
                   .HasForeignKey(i => i.RetailCartId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Medicine)
                   .WithMany(m => m.RetailCartLineItems)
                   .HasForeignKey(i => i.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Creator)
                   .WithMany(u => u.CreatedRetailCartLineItems)
                   .HasForeignKey(i => i.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.Updater)
                   .WithMany(u => u.UpdatedRetailCartLineItems)
                   .HasForeignKey(i => i.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.HospitalGroup)
                   .WithMany(hg => hg.RetailCartLineItems)
                   .HasForeignKey(i => i.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(i => i.Quantity).IsRequired();
            builder.Property(i => i.UnitPrice).HasColumnType("numeric(10,2)").IsRequired();
            builder.Property(i => i.DiscountPercent).HasColumnType("numeric(5,2)").IsRequired();
            builder.Property(i => i.InsuranceCoveredAmount).HasColumnType("numeric(10,2)").IsRequired();
        }
    }
}
