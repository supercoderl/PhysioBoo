using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class BillItemConfiguration : IEntityTypeConfiguration<BillItem>
    {
        public void Configure(EntityTypeBuilder<BillItem> builder)
        {
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

            // Properties
            builder.Property(bi => bi.Type)
                   .HasConversion<string>() // Enum stored as string
                   .HasMaxLength(50)
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

            builder.Property(bi => bi.PerformedDate).IsRequired(false);

            builder.Property(bi => bi.CreatedAt).IsRequired();
        }
    }
}
