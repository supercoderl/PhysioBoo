using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorScheduleConfiguration : IEntityTypeConfiguration<DoctorSchedule>
    {
        public void Configure(EntityTypeBuilder<DoctorSchedule> builder)
        {
            // PK
            builder.HasKey(s => s.Id);

            // Indexes
            builder.HasIndex(s => s.DoctorId);
            builder.HasIndex(s => s.HospitalId);
            builder.HasIndex(s => s.DepartmentId);

            // Relationships
            builder.HasOne(s => s.Doctor)
                   .WithMany(d => d.Schedules)
                   .HasForeignKey(s => s.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Hospital)
                   .WithMany(h => h.DoctorSchedules)
                   .HasForeignKey(s => s.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Department)
                   .WithMany(d => d.DoctorSchedules)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(s => s.DayOfWeek)
                   .IsRequired();

            builder.Property(s => s.StartTime).IsRequired();
            builder.Property(s => s.EndTime).IsRequired();

            builder.Property(s => s.BreakStartTime);
            builder.Property(s => s.BreakEndTime);

            builder.Property(s => s.MaxPatientsPerSlot).IsRequired();
            builder.Property(s => s.SlotDuration).IsRequired();

            builder.Property(s => s.IsAvailable)
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(s => s.ScheduleType)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(s => s.EffectiveFrom).IsRequired();
            builder.Property(s => s.EffectiveTo);

            builder.Property(s => s.ConsultationFee)
                   .HasColumnType("numeric(10,2)");

            builder.Property(s => s.Notes);

            builder.Property(s => s.CreatedAt).IsRequired();
            builder.Property(s => s.UpdatedAt);
        }
    }
}
