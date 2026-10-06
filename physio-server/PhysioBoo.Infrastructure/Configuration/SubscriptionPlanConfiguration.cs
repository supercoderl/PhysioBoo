using PhysioBoo.Domain.Entities.Platform;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
    {
        public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
        {
            // Naming
            builder.ToTable("SubscriptionPlans");

            // PK
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(p => p.Code).IsUnique();

            // Properties
            builder.Property(p => p.Code).IsRequired().HasMaxLength(32);
            builder.Property(p => p.Name).IsRequired().HasMaxLength(80);
            builder.Property(p => p.Description).HasMaxLength(500);
            builder.Property(p => p.MonthlyPrice).HasColumnType("numeric(12,2)");
            builder.Property(p => p.Currency).IsRequired().HasMaxLength(3);
        }
    }
}
