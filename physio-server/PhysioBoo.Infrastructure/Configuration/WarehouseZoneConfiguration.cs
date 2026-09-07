

using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class WarehouseZoneConfiguration : IEntityTypeConfiguration<WarehouseZone>
    {
        public void Configure(EntityTypeBuilder<WarehouseZone> builder)
        {
            // Naming
            builder.ToTable("WarehouseZones");

            // PK
            builder.HasKey(z => z.Id);

            // Indexes
            builder.HasIndex(z => z.HospitalId);

            // Relationships
            builder.HasOne(z => z.Hospital)
                   .WithMany(h => h.WarehouseZones)
                   .HasForeignKey(z => z.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(z => z.Creator)
                   .WithMany(u => u.CreatedWarehouseZones)
                   .HasForeignKey(z => z.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(z => z.Updater)
                   .WithMany(u => u.UpdatedWarehouseZones)
                   .HasForeignKey(z => z.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(z => z.HospitalGroup)
                   .WithMany(hg => hg.WarehouseZones)
                   .HasForeignKey(z => z.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(z => z.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(z => z.Type)
                   .HasConversion<string>()
                   .IsRequired();
        }
    }
}
