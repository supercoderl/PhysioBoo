using PhysioBoo.Domain.Entities.Geography;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class CityConfiguration : IEntityTypeConfiguration<City>
    {
        public void Configure(EntityTypeBuilder<City> builder)
        {
            builder.ToTable("Cities");

            builder.HasKey(c => c.Id);

            // Restrict: deleting a country must never silently wipe its cities, districts and wards.
            builder.HasOne(c => c.Country)
                   .WithMany(x => x.Cities)
                   .HasForeignKey(c => c.CountryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(c => c.Code)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(c => c.IsActive)
                   .IsRequired();

            builder.HasIndex(c => new { c.CountryId, c.Code })
                   .IsUnique();

            builder.Property(c => c.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
