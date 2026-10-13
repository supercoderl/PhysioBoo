

using PhysioBoo.Domain.Entities.Geography;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HospitalGroupConfiguration : IEntityTypeConfiguration<HospitalGroup>
    {
        public void Configure(EntityTypeBuilder<HospitalGroup> builder)
        {
            // Naming
            builder.ToTable("HospitalGroups");

            // PK
            builder.HasKey(hg => hg.Id);

            // Indexes
            builder.HasIndex(hg => hg.Name);

            builder.HasIndex(hg => hg.Code)
                   .IsUnique()
                   .HasFilter("\"Code\" IS NOT NULL AND \"DeletedAt\" IS NULL");

            // Relationships
            builder.HasOne<Country>().WithMany().HasForeignKey(hg => hg.CountryId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne<City>().WithMany().HasForeignKey(hg => hg.CityId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne<District>().WithMany().HasForeignKey(hg => hg.DistrictId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne<GeoWard>().WithMany().HasForeignKey(hg => hg.WardId).OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(hg => hg.Creator)
                   .WithMany(u => u.CreatedHospitalGroups)
                   .HasForeignKey(hg => hg.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(hg => hg.Updater)
                   .WithMany(u => u.UpdatedHospitalGroups)
                   .HasForeignKey(hg => hg.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(hg => hg.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(hg => hg.Code)
                   .HasMaxLength(50);

            builder.Property(hg => hg.ContactPerson)
                   .HasMaxLength(100);

            builder.Property(hg => hg.Description);

            builder.Property(hg => hg.HeadquartersAddress);

            builder.Property(hg => hg.Website)
                   .HasMaxLength(255);

            builder.Property(hg => hg.Phone)
                   .HasMaxLength(20);

            builder.Property(hg => hg.Email)
                   .HasMaxLength(255);

            builder.Property(hg => hg.LogoUrl)
                   .HasMaxLength(500);

            builder.Property(hg => hg.EstablishedDate);

            builder.Property(hg => hg.LicenseNumber)
                   .HasMaxLength(100);

            // JSONB
            builder.Property(hg => hg.AccreditationDetails)
                   .HasColumnType("jsonb");

            builder.Property(hg => hg.IsActive)
                   .IsRequired();

            builder.Property(ms => ms.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
