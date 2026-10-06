using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PointTransactionConfiguration : IEntityTypeConfiguration<PointTransaction>
    {
        public void Configure(EntityTypeBuilder<PointTransaction> builder)
        {
            // Naming
            builder.ToTable("PointTransactions");

            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => new { t.TenantId, t.Code }).IsUnique();
            builder.HasIndex(t => new { t.MemberId, t.OccurredAt });
            builder.HasIndex(t => t.Type);
            builder.HasIndex(t => t.RewardId);

            // Relationships
            // Ledger rows must never disappear with their member, so no cascade.
            builder.HasOne(t => t.Member)
                   .WithMany(m => m.PointTransactions)
                   .HasForeignKey(t => t.MemberId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Reward)
                   .WithMany()
                   .HasForeignKey(t => t.RewardId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(t => t.Code)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(t => t.MemberId)
                   .IsRequired();

            builder.Property(t => t.Type)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(t => t.Points)
                   .IsRequired();

            builder.Property(t => t.BalanceAfter)
                   .IsRequired();

            builder.Property(t => t.Description)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(t => t.RewardId);

            builder.Property(t => t.OccurredAt)
                   .IsRequired();
        }
    }
}
