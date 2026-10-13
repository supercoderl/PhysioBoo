using PhysioBoo.Domain.Entities.Geography;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DistrictConfiguration : IEntityTypeConfiguration<District>
    {
        public void Configure(EntityTypeBuilder<District> builder)
        {
            builder.ToTable("Districts");

            builder.HasKey(d => d.Id);

            builder.HasOne(d => d.City)
                   .WithMany(x => x.Districts)
                   .HasForeignKey(d => d.CityId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(d => d.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(d => d.Code)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(d => d.IsActive)
                   .IsRequired();

            builder.HasIndex(d => new { d.CityId, d.Code })
                   .IsUnique();

            builder.Property(d => d.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
