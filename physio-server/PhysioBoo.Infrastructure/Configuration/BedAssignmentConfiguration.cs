using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class BedAssignmentConfiguration : IEntityTypeConfiguration<BedAssignment>
    {
        public void Configure(EntityTypeBuilder<BedAssignment> builder)
        {
            // Naming
            builder.ToTable("BedAssignments");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            // A bed holds one open stay and a patient occupies one bed at a time.
            // These are the database-level guard behind the checks in BedRepository.
            builder.HasIndex(a => a.BedId)
                   .IsUnique()
                   .HasDatabaseName("IX_BedAssignments_BedId_Open")
                   .HasFilter("\"DischargedAt\" IS NULL");
            builder.HasIndex(a => a.PatientId)
                   .IsUnique()
                   .HasDatabaseName("IX_BedAssignments_PatientId_Open")
                   .HasFilter("\"DischargedAt\" IS NULL");
            builder.HasIndex(a => new { a.BedId, a.AdmittedAt });
            builder.HasIndex(a => a.AdmissionId);

            // Relationships
            // History must survive: no cascade from the bed.
            builder.HasOne(a => a.Bed)
                   .WithMany(b => b.Assignments)
                   .HasForeignKey(a => a.BedId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Patient)
                   .WithMany()
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Admission)
                   .WithMany()
                   .HasForeignKey(a => a.AdmissionId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(a => a.BedId)
                   .IsRequired();

            builder.Property(a => a.PatientId)
                   .IsRequired();

            builder.Property(a => a.AdmissionId);

            builder.Property(a => a.AdmittedAt)
                   .IsRequired();

            builder.Property(a => a.ExpectedDischargeDate);

            builder.Property(a => a.DischargedAt);

            builder.Property(a => a.Notes)
                   .HasMaxLength(1000);

            builder.Property(a => a.AssignedByName)
                   .HasMaxLength(120);
        }
    }
}
