using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HospitalStaffConfiguration : IEntityTypeConfiguration<HospitalStaff>
    {
        public void Configure(EntityTypeBuilder<HospitalStaff> builder)
        {
            // Naming
            builder.ToTable("HospitalStaffs");

            // PK
            builder.HasKey(s => s.Id);

            // Indexes
            builder.HasIndex(s => s.EmployeeId).IsUnique();
            builder.HasIndex(s => s.HospitalId);
            builder.HasIndex(s => s.DepartmentId);

            // Relationships
            builder.HasOne(s => s.Hospital)
                   .WithMany(h => h.HospitalStaffs)
                   .HasForeignKey(s => s.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Department)
                   .WithMany(d => d.HospitalStaffs)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Manager)
                   .WithMany(u => u.HospitalStaffs)
                   .HasForeignKey(s => s.ReportingManger);

            builder.HasOne(s => s.Creator)
                   .WithMany(u => u.CreatedHospitalStaffs)
                   .HasForeignKey(s => s.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(s => s.Updater)
                    .WithMany(u => u.UpdatedHospitalStaffs)
                    .HasForeignKey(s => s.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(s => s.HospitalGroup)
                    .WithMany(hg => hg.HospitalStaffs)
                    .HasForeignKey(s => s.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(s => s.EmployeeId)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(s => s.StaffType)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(s => s.Position)
                   .HasMaxLength(255);

            builder.Property(s => s.EmploymentType)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(s => s.Salary)
                   .HasColumnType("numeric(12,2)");

            builder.Property(s => s.HourlyRate)
                   .HasColumnType("numeric(8,2)");

            builder.Property(s => s.JoiningDate).IsRequired();
            builder.Property(s => s.ProbationEndDate);
            builder.Property(s => s.TerminationDate);

            builder.Property(s => s.EmploymentStatus)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(s => s.ShiftPattern)
                   .HasMaxLength(50);

            builder.Property(s => s.EmergencyContactName)
                   .HasMaxLength(255);

            builder.Property(s => s.EmergencyContactPhone)
                   .HasMaxLength(20);

            builder.Property(s => s.BloodGroup)
                   .HasMaxLength(5);

            builder.Property(s => s.MedicalFitnessExpiry);

            builder.Property(s => s.PoliceVerificationStatus)
                   .IsRequired();

            builder.Property(s => s.BankAccountDetails)
                   .HasColumnType("jsonb");

            builder.Property(s => s.PanNumber)
                   .HasMaxLength(20);

            builder.Property(s => s.EsiNumber)
                   .HasMaxLength(20);

            builder.Property(s => s.PfNumber)
                   .HasMaxLength(20);
        }
    }
}
