using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HandoverCardConfiguration : IEntityTypeConfiguration<HandoverCard>
    {
        public void Configure(EntityTypeBuilder<HandoverCard> builder)
        {
            // Naming
            builder.ToTable("HandoverCards");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            // One card per admission per shift. Also stops two nurses opening the page at once from generating duplicates.
            builder.HasIndex(c => new { c.AdmissionId, c.ShiftDate, c.OutgoingShift })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(c => new { c.ShiftDate, c.OutgoingShift });

            // Relationships
            builder.HasOne(c => c.Admission)
                   .WithMany()
                   .HasForeignKey(c => c.AdmissionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Patient)
                   .WithMany()
                   .HasForeignKey(c => c.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(c => c.ShiftDate)
                   .HasColumnType("date")
                   .IsRequired();

            builder.Property(c => c.OutgoingShift)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.IncomingShift)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.Situation)
                   .IsRequired()
                   .HasMaxLength(2000);

            builder.Property(c => c.Background)
                   .IsRequired()
                   .HasMaxLength(2000);

            builder.Property(c => c.Assessment)
                   .IsRequired()
                   .HasMaxLength(2000);

            builder.Property(c => c.Recommendation)
                   .IsRequired()
                   .HasMaxLength(2000);

            builder.Property(c => c.IsAcknowledged)
                   .IsRequired();

            builder.Property(c => c.AcknowledgedByName)
                   .HasMaxLength(120);

            builder.Property(c => c.AcknowledgedAt);
        }
    }
}
