using PhysioBoo.Domain.Entities.Platform;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class TenantSubscriptionConfiguration : IEntityTypeConfiguration<TenantSubscription>
    {
        public void Configure(EntityTypeBuilder<TenantSubscription> builder)
        {
            // Naming
            builder.ToTable("TenantSubscriptions");

            // PK
            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(s => s.HospitalGroupId).IsUnique();
            builder.HasIndex(s => s.Status);

            // Relationships
            builder.HasOne(s => s.HospitalGroup)
                   .WithMany()
                   .HasForeignKey(s => s.HospitalGroupId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Plan)
                   .WithMany()
                   .HasForeignKey(s => s.PlanId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Invoices)
                   .WithOne(i => i.Subscription)
                   .HasForeignKey(i => i.SubscriptionId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(s => s.BillingEmail).HasMaxLength(254);
            builder.Property(s => s.Notes).HasMaxLength(1000);

            builder.Property(s => s.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
