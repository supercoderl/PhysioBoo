using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class NursingAssignmentConfiguration : IEntityTypeConfiguration<NursingAssignment>
    {
        public void Configure(EntityTypeBuilder<NursingAssignment> builder)
        {
            // Naming
            builder.ToTable("NursingAssignments");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            // A patient has one nurse per shift. Filtered so a removed assignment can be re-created.
            builder.HasIndex(a => new { a.AdmissionId, a.Shift, a.ShiftDate })
                   .IsUnique()
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(a => new { a.NurseUserId, a.Shift, a.ShiftDate });
            builder.HasIndex(a => a.PatientId);

            // Relationships
            builder.HasOne(a => a.Admission)
                   .WithMany()
                   .HasForeignKey(a => a.AdmissionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Patient)
                   .WithMany()
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(a => a.NurseUserId)
                   .IsRequired();

            builder.Property(a => a.Shift)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.ShiftDate)
                   .HasColumnType("date")
                   .IsRequired();

            builder.Property(a => a.Acuity)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.FallRisk)
                   .IsRequired();
        }
    }
}
