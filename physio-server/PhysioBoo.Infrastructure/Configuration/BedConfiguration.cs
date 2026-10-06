using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class BedConfiguration : IEntityTypeConfiguration<Bed>
    {
        public void Configure(EntityTypeBuilder<Bed> builder)
        {
            // Naming
            builder.ToTable("Beds");

            // PK
            builder.HasKey(b => b.Id);

            // Indexes
            // Filtered so a soft-deleted bed does not block reusing its number.
            builder.HasIndex(b => new { b.TenantId, b.WardId, b.Number })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(b => b.WardId);
            builder.HasIndex(b => b.Status);
            builder.HasIndex(b => b.Floor);

            // Relationships
            builder.HasOne(b => b.Ward)
                   .WithMany(w => w.Beds)
                   .HasForeignKey(b => b.WardId)
                   .OnDelete(DeleteBehavior.Restrict);

            // The open stay. Circular with BedAssignment.BedId, so it must be nullable and SetNull.
            builder.HasOne(b => b.CurrentAssignment)
                   .WithMany()
                   .HasForeignKey(b => b.CurrentAssignmentId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(b => b.Number)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(b => b.RoomNumber)
                   .HasMaxLength(32);

            builder.Property(b => b.Floor)
                   .IsRequired();

            builder.Property(b => b.BedType)
                   .HasConversion<string>()
                   .HasMaxLength(24)
                   .IsRequired();

            builder.Property(b => b.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(b => b.IsolationRequired)
                   .IsRequired();

            builder.Property(b => b.Notes)
                   .HasMaxLength(1000);

            builder.Property(b => b.CurrentAssignmentId);
        }
    }
}
