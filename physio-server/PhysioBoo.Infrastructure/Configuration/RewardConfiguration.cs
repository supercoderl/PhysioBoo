using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RewardConfiguration : IEntityTypeConfiguration<Reward>
    {
        public void Configure(EntityTypeBuilder<Reward> builder)
        {
            // Naming
            builder.ToTable("Rewards");

            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => new { r.TenantId, r.Code }).IsUnique();
            builder.HasIndex(r => r.Category);
            builder.HasIndex(r => r.IsAvailable);

            // Relationships
            // (none: PointTransaction owns the optional link to Reward)

            // Properties
            builder.Property(r => r.Code)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(r => r.Title)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(r => r.Description)
                   .HasMaxLength(1000);

            builder.Property(r => r.PointsRequired)
                   .IsRequired();

            builder.Property(r => r.Category)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(r => r.IsAvailable)
                   .IsRequired();
        }
    }
}
