using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class OperatingRoomConfiguration : IEntityTypeConfiguration<OperatingRoom>
    {
        public void Configure(EntityTypeBuilder<OperatingRoom> builder)
        {
            // Naming
            builder.ToTable("OperatingRooms");

            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            // Filtered so a soft-deleted room does not block reusing its number.
            builder.HasIndex(r => new { r.TenantId, r.RoomNumber })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(r => r.Status);

            // Properties
            builder.Property(r => r.RoomNumber)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(r => r.RoomType)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(r => r.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(r => r.EquipmentReady)
                   .IsRequired();
        }
    }
}
