using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class WardConfiguration : IEntityTypeConfiguration<Ward>
    {
        public void Configure(EntityTypeBuilder<Ward> builder)
        {
            // Naming
            builder.ToTable("Wards");

            // PK
            builder.HasKey(w => w.Id);

            // Indexes
            // Filtered so a soft-deleted ward does not block reusing its code.
            builder.HasIndex(w => new { w.TenantId, w.Code })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(w => w.Floor);
            builder.HasIndex(w => w.DepartmentId);

            // Relationships
            builder.HasOne(w => w.Department)
                   .WithMany()
                   .HasForeignKey(w => w.DepartmentId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(w => w.Code)
                   .HasMaxLength(32);

            builder.Property(w => w.Name)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(w => w.Floor)
                   .IsRequired();

            builder.Property(w => w.DepartmentId);
        }
    }
}
