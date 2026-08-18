using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RoomConfiguration : IEntityTypeConfiguration<Room>
    {
        public void Configure(EntityTypeBuilder<Room> builder)
        {
            // Naming
            builder.ToTable("Rooms");

            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.HospitalId);
            builder.HasIndex(r => r.DepartmentId);
            builder.HasIndex(r => new { r.HospitalId, r.RoomNumber }).IsUnique();

            // Relationships
            builder.HasOne(r => r.Hospital)
                   .WithMany(h => h.Rooms)
                   .HasForeignKey(r => r.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Department)
                   .WithMany(d => d.Rooms)
                   .HasForeignKey(r => r.DepartmentId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(r => r.Creator)
                   .WithMany(u => u.CreatedRooms)
                   .HasForeignKey(r => r.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(r => r.Updater)
                   .WithMany(u => u.UpdatedRooms)
                   .HasForeignKey(r => r.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(r => r.HospitalGroup)
                   .WithMany(hg => hg.Rooms)
                   .HasForeignKey(r => r.TenantId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(r => r.RoomNumber)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(r => r.Name)
                   .HasMaxLength(255);

            builder.Property(r => r.RoomType)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(r => r.FloorNumber);

            builder.Property(r => r.Wing)
                   .HasMaxLength(50);

            builder.Property(r => r.Capacity);

            builder.Property(r => r.IsActive).IsRequired();
        }
    }
}
