

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RetailTransactionConfiguration : IEntityTypeConfiguration<RetailTransaction>
    {
        public void Configure(EntityTypeBuilder<RetailTransaction> builder)
        {
            // Naming
            builder.ToTable("RetailTransactions");

            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => t.TransactionNumber).IsUnique();
            builder.HasIndex(t => t.HospitalId);
            builder.HasIndex(t => t.CashierId);
            builder.HasIndex(t => t.CompletedAt);

            // Relationships
            builder.HasOne(t => t.Hospital)
                   .WithMany(h => h.RetailTransactions)
                   .HasForeignKey(t => t.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.CustomerPatient)
                   .WithMany(p => p.RetailTransactions)
                   .HasForeignKey(t => t.CustomerPatientId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.Cashier)
                   .WithMany(u => u.CashieredRetailTransactions)
                   .HasForeignKey(t => t.CashierId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Creator)
                   .WithMany(u => u.CreatedRetailTransactions)
                   .HasForeignKey(t => t.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.Updater)
                   .WithMany(u => u.UpdatedRetailTransactions)
                   .HasForeignKey(t => t.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.HospitalGroup)
                   .WithMany(hg => hg.RetailTransactions)
                   .HasForeignKey(t => t.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(t => t.TransactionNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(t => t.CustomerType).HasConversion<string>();
            builder.Property(t => t.CustomerFullName).HasMaxLength(200);
            builder.Property(t => t.CustomerPhone).HasMaxLength(30);
            builder.Property(t => t.CustomerMrn).HasMaxLength(50);
            builder.Property(t => t.CustomerInsuranceProvider).HasMaxLength(200);

            builder.Property(t => t.Subtotal).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.DiscountTotal).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.InsuranceCoverage).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.Vat).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.GrandTotal).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.AmountTendered).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.ChangeDue).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(t => t.CompletedAt).IsRequired();

            builder.Property(t => t.Status)
                   .HasConversion<string>()
                   .IsRequired();
        }
    }
}
