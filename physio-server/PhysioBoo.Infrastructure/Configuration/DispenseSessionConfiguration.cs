using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DispenseSessionConfiguration : IEntityTypeConfiguration<DispenseSession>
    {
        public void Configure(EntityTypeBuilder<DispenseSession> builder)
        {
            // Naming
            builder.ToTable("DispenseSessions");

            // PK (assigned in code; sessions are added through the change tracker)
            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(s => s.PrescriptionId).IsUnique();
            builder.HasIndex(s => s.Status);

            // Relationships
            builder.HasOne(s => s.Prescription)
                   .WithMany()
                   .HasForeignKey(s => s.PrescriptionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Items)
                   .WithOne(i => i.Session)
                   .HasForeignKey(i => i.SessionId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(s => s.PharmacistNotes).HasMaxLength(2000);
            builder.Property(s => s.HoldReason).HasMaxLength(500);
            builder.Property(s => s.CancelReason).HasMaxLength(500);

            builder.Property(s => s.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
