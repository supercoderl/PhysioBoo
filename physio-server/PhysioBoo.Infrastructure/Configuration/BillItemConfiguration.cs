using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class BillItemConfiguration : IEntityTypeConfiguration<BillItem>
    {
        public void Configure(EntityTypeBuilder<BillItem> builder)
        {
            // Naming
            builder.ToTable("BillItems");

            // PK
            builder.HasKey(bi => bi.Id);

            // Indexes
            builder.HasIndex(bi => bi.BillId);

            // Relationships
            builder.HasOne(bi => bi.Bill)
                   .WithMany(b => b.BillItems)
                   .HasForeignKey(bi => bi.BillId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bi => bi.PerformedByUser)
                   .WithMany(u => u.PerformedBillItems)
                   .HasForeignKey(bi => bi.PerformedBy);

            builder.HasOne(bi => bi.Creator)
                   .WithMany(u => u.CreatedBillItems)
                   .HasForeignKey(bi => bi.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bi => bi.Updater)
                   .WithMany(u => u.UpdatedBillItems)
                   .HasForeignKey(bi => bi.UpdatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bi => bi.HospitalGroup)
                   .WithMany(hg => hg.BillItems)
                   .HasForeignKey(bi => bi.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(bi => bi.Type)
                   .HasConversion<string>() // Enum stored as string
                   .IsRequired();

            builder.Property(bi => bi.ItemCode).HasMaxLength(100);
            builder.Property(bi => bi.ItemName).HasMaxLength(255);
            builder.Property(bi => bi.Description);

            builder.Property(bi => bi.Quantity).IsRequired();

            builder.Property(bi => bi.UnitPrice).HasColumnType("numeric(10,2)");
            builder.Property(bi => bi.DiscountPercentage).HasColumnType("numeric(5,2)");
            builder.Property(bi => bi.DiscountAmount).HasColumnType("numeric(10,2)");
            builder.Property(bi => bi.TaxPercentage).HasColumnType("numeric(5,2)");
            builder.Property(bi => bi.TaxAmount).HasColumnType("numeric(10,2)");
            builder.Property(bi => bi.TotalAmount).HasColumnType("numeric(10,2)");

            builder.Property(bi => bi.ReferenceId);

            builder.Property(bi => bi.IsInsuranceCovered).IsRequired();
            builder.Property(bi => bi.InsuranceCopayPercentage).HasColumnType("numeric(5,2)");
        }
    }
}
