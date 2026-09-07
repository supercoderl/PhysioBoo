

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RetailPaymentSplitConfiguration : IEntityTypeConfiguration<RetailPaymentSplit>
    {
        public void Configure(EntityTypeBuilder<RetailPaymentSplit> builder)
        {
            // Naming
            builder.ToTable("RetailPaymentSplits");

            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => p.RetailTransactionId);

            // Relationships
            builder.HasOne(p => p.RetailTransaction)
                   .WithMany(t => t.RetailPaymentSplits)
                   .HasForeignKey(p => p.RetailTransactionId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Creator)
                   .WithMany(u => u.CreatedRetailPaymentSplits)
                   .HasForeignKey(p => p.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(p => p.Updater)
                   .WithMany(u => u.UpdatedRetailPaymentSplits)
                   .HasForeignKey(p => p.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(p => p.HospitalGroup)
                   .WithMany(hg => hg.RetailPaymentSplits)
                   .HasForeignKey(p => p.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(p => p.Method)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(p => p.Amount).HasColumnType("numeric(10,2)").IsRequired();
        }
    }
}
