using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class AdmissionConfiguration : IEntityTypeConfiguration<Admission>
    {
        public void Configure(EntityTypeBuilder<Admission> builder)
        {
            // Naming
            builder.ToTable("Admissions");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => new { a.TenantId, a.AdmissionNumber }).IsUnique();
            // A patient has at most one active admission.
            builder.HasIndex(a => a.PatientId)
                   .IsUnique()
                   .HasDatabaseName("IX_Admissions_PatientId_Admitted")
                   .HasFilter("\"Status\" = 'Admitted' AND \"DeletedAt\" IS NULL");
            builder.HasIndex(a => a.Status);
            builder.HasIndex(a => a.AdmittedAt);
            builder.HasIndex(a => a.DepartmentId);
            builder.HasIndex(a => a.DoctorId);

            // Relationships
            builder.HasOne(a => a.Patient)
                   .WithMany()
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Department)
                   .WithMany()
                   .HasForeignKey(a => a.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Doctor)
                   .WithMany()
                   .HasForeignKey(a => a.DoctorId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(a => a.AdmissionNumber)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(a => a.AdmissionType)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.AdmittedAt)
                   .IsRequired();

            builder.Property(a => a.ReferredBy)
                   .HasMaxLength(120);

            builder.Property(a => a.ChiefComplaint)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(a => a.ProvisionalDiagnosis)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(a => a.Allergies)
                   .HasMaxLength(1000);

            builder.Property(a => a.CurrentMedications)
                   .HasMaxLength(1000);

            builder.Property(a => a.MedicalHistory)
                   .HasMaxLength(2000);

            builder.Property(a => a.HasInsurance)
                   .IsRequired();

            builder.Property(a => a.InsuranceProvider)
                   .HasMaxLength(120);

            builder.Property(a => a.PolicyNumber)
                   .HasMaxLength(64);

            builder.Property(a => a.DischargedAt);

            builder.Property(a => a.DischargeNotes)
                   .HasMaxLength(2000);
        }
    }
}
