using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicalRecordConfiguration : IEntityTypeConfiguration<MedicalRecord>
    {
        public void Configure(EntityTypeBuilder<MedicalRecord> builder)
        {
            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.RecordNumber).IsUnique();
            builder.HasIndex(r => r.PatientId);
            builder.HasIndex(r => r.AppointmentId);
            builder.HasIndex(r => r.DoctorId);
            builder.HasIndex(r => r.HospitalId);

            // Relationships
            builder.HasOne(r => r.Patient)
                   .WithMany(p => p.MedicalRecords)
                   .HasForeignKey(r => r.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Appointment)
                   .WithMany(a => a.MedicalRecords)
                   .HasForeignKey(r => r.AppointmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Doctor)
                   .WithMany(d => d.MedicalRecords)
                   .HasForeignKey(r => r.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Hospital)
                   .WithMany(h => h.MedicalRecords)
                   .HasForeignKey(r => r.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Creator)
                   .WithMany(u => u.CreatedMedicalRecords)
                   .HasForeignKey(r => r.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(r => r.RecordNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(r => r.RecordDate)
                   .IsRequired();

            builder.Property(r => r.RecordType)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(r => r.ChiefComplaint);
            builder.Property(r => r.HistoryOfPresentIllness);
            builder.Property(r => r.PastMedicalHistory);
            builder.Property(r => r.FamilyHistory);
            builder.Property(r => r.SocialHistory);
            builder.Property(r => r.ReviewOfSystems);
            builder.Property(r => r.PhysicalExamination);
            builder.Property(r => r.VitalSigns);
            builder.Property(r => r.ClinicalFindings);
            builder.Property(r => r.ProvisionalDiagnosis);
            builder.Property(r => r.FinalDiagnosis);

            builder.Property(r => r.Icd10Codes)
                   .HasColumnType("text[]");

            builder.Property(r => r.DifferencentialDiagnosis);
            builder.Property(r => r.TreatmentPlan);
            builder.Property(r => r.MedicationsPrescribed);
            builder.Property(r => r.ProceduresPerformed);
            builder.Property(r => r.InvestigationsOrdered);
            builder.Property(r => r.FollowUpInstructions);
            builder.Property(r => r.Prognosis);
            builder.Property(r => r.DoctorNotes);
            builder.Property(r => r.PatientEducationProvided);
            builder.Property(r => r.DischargeSummary);

            builder.Property(r => r.IsConfidential)
                   .IsRequired();

            builder.Property(r => r.AccessLevel)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(r => r.CreatedAt)
                   .IsRequired();

            builder.Property(r => r.UpdatedAt);
        }
    }
}
