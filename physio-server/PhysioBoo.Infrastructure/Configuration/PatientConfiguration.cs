using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PatientConfiguration : IEntityTypeConfiguration<Patient>
    {
        public void Configure(EntityTypeBuilder<Patient> builder)
        {
            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => p.PatientNumber).IsUnique();
            builder.HasIndex(p => p.PrimaryDoctorId);
            builder.HasIndex(p => p.ReferredBy);
            builder.HasIndex(p => p.ReferralHospitalId);
            builder.HasIndex(p => p.PreferredHospitalId);
            builder.HasIndex(p => p.PreferredDoctorId);

            // Relationships
            builder.HasOne(p => p.PrimaryDoctor)
                   .WithMany(d => d.Patients)
                   .HasForeignKey(p => p.PrimaryDoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.ReferringDoctor)
                   .WithMany(d => d.ReferredPatients)
                   .HasForeignKey(p => p.ReferredBy);

            builder.HasOne(p => p.ReferralHospital)
                   .WithMany(h => h.ReferredPatients)
                   .HasForeignKey(p => p.ReferralHospitalId);

            builder.HasOne(p => p.PreferredHospital)
                   .WithMany(h => h.PreferredPatients)
                   .HasForeignKey(p => p.PreferredHospitalId);

            builder.HasOne(p => p.PreferredDoctor)
                   .WithMany(d => d.PreferredPatients)
                   .HasForeignKey(p => p.PreferredDoctorId);

            builder.HasOne(p => p.User)
                .WithOne(u => u.Patient)
                .HasForeignKey<Patient>(p => p.Id);

            // Properties
            builder.Property(p => p.PatientNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(p => p.RegistrationDate);

            builder.Property(p => p.PatientType)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(p => p.InssuranceProvider).HasMaxLength(255);
            builder.Property(p => p.InssurancePolicyNumber).HasMaxLength(100);
            builder.Property(p => p.InssuranceExpiryDate);
            builder.Property(p => p.InssuranceCoverageAmount).HasColumnType("numeric(12,2)");

            builder.Property(p => p.IsVip).IsRequired();
            builder.Property(p => p.IsSeniorCitizen).IsRequired();
            builder.Property(p => p.IsChronicPatient).IsRequired();

            builder.Property(p => p.MedicalHistory);
            builder.Property(p => p.FamilyHistory);
            builder.Property(p => p.SurgicalHistory);
            builder.Property(p => p.AllergyInformation);
            builder.Property(p => p.CurrentMedications);
            builder.Property(p => p.LifestyleNotes);
            builder.Property(p => p.Occupation).HasMaxLength(255);
            builder.Property(p => p.AnnualIncomeRange).HasMaxLength(50);

            builder.Property(p => p.PreferredAppointmentTime).HasMaxLength(20);

            builder.Property(p => p.CommunicationPreferences)
                   .HasColumnType("jsonb");

            builder.Property(p => p.ConsentForResearch).IsRequired();
            builder.Property(p => p.ConsentForMarketing).IsRequired();
            builder.Property(p => p.DataSharingConsent).IsRequired();

            builder.Property(p => p.LastVisitDate);
            builder.Property(p => p.NextFollowUpDate);

            builder.Property(p => p.TotalVisits).IsRequired();
            builder.Property(p => p.TotalAmountSpent).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(p => p.OutstandingBalance).HasColumnType("numeric(12,2)").IsRequired();
            builder.Property(p => p.LoyaltyPoints).IsRequired();

            builder.Property(p => p.RiskLevel)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.UpdatedAt);
        }
    }
}
