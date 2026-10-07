using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HomeBannerConfiguration : IEntityTypeConfiguration<HomeBanner>
    {
        public void Configure(EntityTypeBuilder<HomeBanner> builder)
        {
            // Naming
            builder.ToTable("HomeBanners");

            // PK
            builder.HasKey(x => x.Id);

            // Indexes: the public home page reads active items in display order
            builder.HasIndex(x => new { x.TenantId, x.Active, x.Order });

            // Relationships
            // (none)

            // Properties
            builder.Property(x => x.Title)
                   .IsRequired()
                   .HasMaxLength(150);
            builder.Property(x => x.Subtitle)
                   .HasMaxLength(300);
            builder.Property(x => x.ImageUrl)
                   .HasMaxLength(1000);
            builder.Property(x => x.ButtonText)
                   .HasMaxLength(60);
            builder.Property(x => x.ButtonLink)
                   .HasMaxLength(1000);
            builder.Property(x => x.Order);
            builder.Property(x => x.Active);
        }
    }
}
