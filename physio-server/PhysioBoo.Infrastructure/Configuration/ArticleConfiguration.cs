

using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ArticleConfiguration : IEntityTypeConfiguration<Article>
    {
        public void Configure(EntityTypeBuilder<Article> builder)
        {
            // Naming
            builder.ToTable("Articles");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => a.Title);
            builder.HasIndex(a => a.Slug).IsUnique();
            builder.HasIndex(a => a.Status);
            builder.HasIndex(a => a.Category);
            builder.HasIndex(a => a.SearchVector).HasMethod("GIN");

            // Properties
            builder.Property(a => a.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(a => a.Slug)
                   .IsRequired()
                   .HasMaxLength(250);

            builder.Property(a => a.Category)
                   .IsRequired()
                   .HasConversion<int>();

            builder.Property(a => a.Tags)
                   .HasMaxLength(500);

            builder.Property(a => a.CoverImageUrl);

            builder.Property(a => a.Excerpt)
                   .IsRequired()
                   .HasMaxLength(300);

            builder.Property(a => a.Content)
                   .IsRequired();

            builder.Property(a => a.Author)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(a => a.Status)
                   .IsRequired()
                   .HasConversion<int>();

            builder.Property(a => a.ReadTime)
                   .HasMaxLength(50);

            builder.Property(a => a.SearchVector)
                .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Title\", '') || ' ' || coalesce(\"Excerpt\", '') || ' ' || coalesce(\"Tags\", '')))", stored: true)
                .ValueGeneratedOnAddOrUpdate();
        }
    }
}
