using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PatientMedicalHistoryConfiguration : IEntityTypeConfiguration<PatientMedicalHistory>
    {
        public void Configure(EntityTypeBuilder<PatientMedicalHistory> builder)
        {
            // PK
            builder.HasKey(m => m.Id);

            // Indexes
            builder.HasIndex(m => m.PatientId);
            builder.HasIndex(m => m.ConditionName);
            builder.HasIndex(m => m.Icd10Code);

            // Relationships
            builder.HasOne(m => m.Patient)
                   .WithMany(p => p.MedicalHistories)
                   .HasForeignKey(m => m.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.DiagnosedDoctor)
                   .WithMany(d => d.DiagnosedHistories)
                   .HasForeignKey(m => m.DiagnosedBy);

            builder.HasOne(m => m.DiagnosisHospital)
                   .WithMany(h => h.PatientMedicalHistories)
                   .HasForeignKey(m => m.DiagnosisHospitalId);

            // Properties
            builder.Property(m => m.ConditionName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(m => m.ConditionCategory)
                   .HasMaxLength(100);

            builder.Property(m => m.Icd10Code)
                   .HasMaxLength(20);

            builder.Property(m => m.DiagnosedDate);

            builder.Property(m => m.Severity)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(m => m.CurrentStatus)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(m => m.TreatmentSummary);
            builder.Property(m => m.MedicationsPrescribed);

            builder.Property(m => m.FollowUpRequired)
                   .IsRequired();

            builder.Property(m => m.NextReviewDate);
            builder.Property(m => m.Notes);

            builder.Property(m => m.CreatedAt)
                   .IsRequired();

            builder.Property(m => m.UpdatedAt);
        }
    }
}
