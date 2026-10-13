using PhysioBoo.Domain.Entities.Geography;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class GeoWardConfiguration : IEntityTypeConfiguration<GeoWard>
    {
        public void Configure(EntityTypeBuilder<GeoWard> builder)
        {
            builder.ToTable("GeoWards");

            builder.HasKey(w => w.Id);

            builder.HasOne(w => w.District)
                   .WithMany(x => x.Wards)
                   .HasForeignKey(w => w.DistrictId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(w => w.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(w => w.Code)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(w => w.IsActive)
                   .IsRequired();

            builder.HasIndex(w => new { w.DistrictId, w.Code })
                   .IsUnique();

            builder.Property(w => w.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
