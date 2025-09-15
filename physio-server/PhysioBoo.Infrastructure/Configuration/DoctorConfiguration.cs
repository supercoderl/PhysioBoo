using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
    {
        public void Configure(EntityTypeBuilder<Doctor> builder)
        {
            // PK
            builder.HasKey(d => d.Id);

            // Indexes
            builder.HasIndex(d => d.EmployeeId).IsUnique(false);
            builder.HasIndex(d => d.MedicalLicenseNumber).IsUnique();

            // Relationships
            builder.HasOne(d => d.PrimarySpecialty)
                   .WithMany(s => s.Doctors)
                   .HasForeignKey(d => d.PrimarySpecialtyId);

            builder.HasOne(d => d.VerifiedByUser)
                   .WithMany(u => u.VerifiedDoctors)
                   .HasForeignKey(d => d.VerifiedBy);

            // Properties
            builder.Property(d => d.EmployeeId)
                   .HasMaxLength(50);

            builder.Property(d => d.MedicalLicenseNumber)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(d => d.MedicalLicenseExpiry)
                   .IsRequired();

            builder.Property(d => d.MedicalLicenseIssuingAuthority)
                   .HasMaxLength(255);

            builder.Property(d => d.YearsOfExperience).IsRequired();
            builder.Property(d => d.YearsOfPractice).IsRequired();

            // Fees
            builder.Property(d => d.ConsultationFeeMin).HasColumnType("numeric(10,2)");
            builder.Property(d => d.ConsultationFeeMax).HasColumnType("numeric(10,2)");
            builder.Property(d => d.FollowUpFee).HasColumnType("numeric(10,2)");
            builder.Property(d => d.EmergencyConsultationFee).HasColumnType("numeric(10,2)");
            builder.Property(d => d.HomeVisitFee).HasColumnType("numeric(10,2)");
            builder.Property(d => d.VideoConsultationFee).HasColumnType("numeric(10,2)");

            // Arrays (Postgres native)
            builder.Property(d => d.LanguagesSpoken)
                   .HasColumnType("text[]");

            builder.Property(d => d.PaymentMethods)
                   .HasColumnType("text[]");

            // Ratings / scores
            builder.Property(d => d.SuccessRate).HasColumnType("numeric(5,2)");
            builder.Property(d => d.PatientSatisfactionScore).HasColumnType("numeric(3,2)");
            builder.Property(d => d.AverageRating).HasColumnType("numeric(3,2)");

            builder.Property(d => d.TotalReviews).IsRequired();
            builder.Property(d => d.TotalPatientTreated).IsRequired();
            builder.Property(d => d.TotalSurgeriesPerformed).IsRequired();

            // Text fields
            builder.Property(d => d.Bio);
            builder.Property(d => d.About);
            builder.Property(d => d.Archivements);
            builder.Property(d => d.ResearchInterests);
            builder.Property(d => d.CancellationPolicy);
            builder.Property(d => d.BankAccountDetails);
            builder.Property(d => d.PanNumber).HasMaxLength(20);
            builder.Property(d => d.Gstin).HasMaxLength(20);

            builder.Property(d => d.PublicationsCount).IsRequired();
            builder.Property(d => d.ConferencePresentations).IsRequired();

            // Availability
            builder.Property(d => d.IsAvailableOnline).IsRequired();
            builder.Property(d => d.IsAvailableHomeVisit).IsRequired();
            builder.Property(d => d.IsAvailableEmergency).IsRequired();

            builder.Property(d => d.ConsultationDuration).IsRequired();
            builder.Property(d => d.BufferTime).IsRequired();
            builder.Property(d => d.AdvanceBookingDays).IsRequired();

            // Employment
            builder.Property(d => d.JoiningDate);
            builder.Property(d => d.TerminationDate);
            builder.Property(d => d.EmploymentStatus)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(d => d.IsFeatured).IsRequired();
            builder.Property(d => d.IsVerified).IsRequired();

            builder.Property(d => d.VerificationDate).IsRequired(false);

            // Audit fields
            builder.Property(d => d.CreatedAt).IsRequired();
            builder.Property(d => d.UpdatedAt).IsRequired(false);
        }
    }
}
