using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => p.PaymentNumber).IsUnique();
            builder.HasIndex(p => p.BillId);
            builder.HasIndex(p => p.PatientId);
            builder.HasIndex(p => p.ProcessedBy);

            // Relationships
            builder.HasOne(p => p.Bill)
                   .WithMany(b => b.Payments)
                   .HasForeignKey(p => p.BillId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Patient)
                   .WithMany(pt => pt.Payments)
                   .HasForeignKey(p => p.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Processor)
                   .WithMany(u => u.ProcessedPayments)
                   .HasForeignKey(p => p.ProcessedBy);

            // Properties
            builder.Property(p => p.PaymentNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(p => p.PaymentDate).IsRequired();
            builder.Property(p => p.PaymentTime).IsRequired();

            builder.Property(p => p.Amount)
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(p => p.Method)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(p => p.TransactionId).HasMaxLength(100);
            builder.Property(p => p.ReferenceNumber).HasMaxLength(100);
            builder.Property(p => p.BankName).HasMaxLength(255);
            builder.Property(p => p.CashLastFour).HasMaxLength(4);

            builder.Property(p => p.GatewayResponse)
                   .HasColumnType("jsonb");

            builder.Property(p => p.Status)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(p => p.FailureReason);

            builder.Property(p => p.ReceiptGenerated).IsRequired();
            builder.Property(p => p.ReceiptUrl).HasMaxLength(500);

            builder.Property(p => p.RefundAmount)
                   .HasColumnType("numeric(12,2)")
                   .IsRequired();

            builder.Property(p => p.RefundDate);
            builder.Property(p => p.RefundReason);
            builder.Property(p => p.Notes);

            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.UpdatedAt);
        }
    }
}
