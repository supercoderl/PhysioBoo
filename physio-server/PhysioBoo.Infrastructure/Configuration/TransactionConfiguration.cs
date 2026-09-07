

using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            // Naming
            builder.ToTable("Transactions");

            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => t.MerchantReference).IsUnique();
            builder.HasIndex(t => t.InvoiceNo);
            builder.HasIndex(t => t.GatewayTransactionId);
            builder.HasIndex(t => t.RelatedEntityId);

            // Properties
            builder.Property(t => t.MerchantReference)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(t => t.InvoiceNo)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(t => t.GatewayTransactionId).HasMaxLength(100);

            builder.Property(t => t.GatewayProvider)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(t => t.Amount).IsRequired();

            builder.Property(t => t.Currency)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(t => t.Status)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(t => t.GatewayResultCode).HasMaxLength(50);
            builder.Property(t => t.GatewayResultMessage);
            builder.Property(t => t.PaymentMethod).HasMaxLength(20);
            builder.Property(t => t.BankCode).HasMaxLength(20);
            builder.Property(t => t.PaymentUrl).HasMaxLength(1000);
            builder.Property(t => t.QrCode);
            builder.Property(t => t.QrContent);
            builder.Property(t => t.LinkExpTime).HasMaxLength(50);
        }
    }
}
