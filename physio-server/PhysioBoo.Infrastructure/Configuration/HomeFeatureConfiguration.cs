using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HomeFeatureConfiguration : IEntityTypeConfiguration<HomeFeature>
    {
        public void Configure(EntityTypeBuilder<HomeFeature> builder)
        {
            // Naming
            builder.ToTable("HomeFeatures");

            // PK
            builder.HasKey(x => x.Id);

            // Indexes: the public home page reads active items in display order
            builder.HasIndex(x => new { x.TenantId, x.Active, x.Order });

            // Relationships
            // (none)

            // Properties
            builder.Property(x => x.Icon)
                   .HasMaxLength(60);
            builder.Property(x => x.Title)
                   .IsRequired()
                   .HasMaxLength(100);
            builder.Property(x => x.Description)
                   .HasMaxLength(500);
            builder.Property(x => x.Order);
            builder.Property(x => x.Active);
        }
    }
}
