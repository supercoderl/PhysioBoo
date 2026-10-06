using PhysioBoo.Domain.Entities.Platform;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SubscriptionInvoiceConfiguration : IEntityTypeConfiguration<SubscriptionInvoice>
    {
        public void Configure(EntityTypeBuilder<SubscriptionInvoice> builder)
        {
            // Naming
            builder.ToTable("SubscriptionInvoices");

            // PK
            builder.HasKey(i => i.Id);
            builder.Property(i => i.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(i => i.InvoiceNumber).IsUnique();
            builder.HasIndex(i => new { i.SubscriptionId, i.PeriodStart });
            builder.HasIndex(i => i.HospitalGroupId);
            builder.HasIndex(i => i.Status);

            // Properties
            builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(32);
            builder.Property(i => i.PlanName).IsRequired().HasMaxLength(80);
            builder.Property(i => i.Amount).HasColumnType("numeric(12,2)");
            builder.Property(i => i.Currency).IsRequired().HasMaxLength(3);
            builder.Property(i => i.PaymentReference).HasMaxLength(120);

            builder.Property(i => i.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
