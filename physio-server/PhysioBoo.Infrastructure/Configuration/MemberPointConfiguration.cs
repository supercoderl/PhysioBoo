using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MemberPointConfiguration : IEntityTypeConfiguration<MemberPoint>
    {
        public void Configure(EntityTypeBuilder<MemberPoint> builder)
        {
            // Naming
            builder.ToTable("MemberPoints");

            // PK
            builder.HasKey(m => m.Id);

            // Indexes
            // Member numbers are generated per tenant, so uniqueness is per tenant.
            builder.HasIndex(m => new { m.TenantId, m.MemberNumber }).IsUnique();
            // One active enrollment per patient. Filtered so a soft-deleted member can re-enroll.
            builder.HasIndex(m => new { m.TenantId, m.PatientId })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(m => m.Tier);
            builder.HasIndex(m => m.Status);

            // Relationships
            builder.HasOne(m => m.Patient)
                   .WithMany()
                   .HasForeignKey(m => m.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(m => m.MemberNumber)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(m => m.PatientId)
                   .IsRequired();

            builder.Property(m => m.Tier)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(m => m.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(m => m.Points)
                   .IsRequired();

            builder.Property(m => m.JoinedAt)
                   .IsRequired();
        }
    }
}
