using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            // Key
            builder.HasKey(a => a.Id);

            // Indexes (optional)
            builder.HasIndex(a => a.AppointmentNumber).IsUnique();
            builder.HasIndex(a => a.PatientId);
            builder.HasIndex(a => a.DoctorId);
            builder.HasIndex(a => a.HospitalId);

            // Relationships
            builder.HasOne(a => a.Patient)
                   .WithMany(p => p.Appointments)
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Doctor)
                   .WithMany(d => d.Appointments)
                   .HasForeignKey(a => a.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Hospital)
                   .WithMany(h => h.Appointments)
                   .HasForeignKey(a => a.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Department)
                   .WithMany(d => d.Appointments)
                   .HasForeignKey(a => a.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.AppointmentType)
                   .WithMany(t => t.Appointments)
                   .HasForeignKey(a => a.AppointmentTypeId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.ReferringDoctor)
                   .WithMany(d => d.ReferredAppointments)
                   .HasForeignKey(a => a.ReferringDoctorId);

            builder.HasOne(a => a.CancelledByUser)
                   .WithMany(u => u.CancelledAppointments)
                   .HasForeignKey(a => a.CancelledBy);

            builder.HasOne(a => a.RescheduledFromAppointment)
                   .WithMany(r => r.RescheduledAppointments)
                   .HasForeignKey(a => a.RescheduledFromAppointmentId);

            builder.HasOne(a => a.CreatedByUser)
                   .WithMany(u => u.CreatedAppointments)
                   .HasForeignKey(a => a.CreatedBy);

            // Property configs
            builder.Property(a => a.AppointmentNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(a => a.ScheduledDate).IsRequired();
            builder.Property(a => a.ScheduledTime).IsRequired();

            builder.Property(a => a.DurationMinutes).IsRequired();

            builder.Property(a => a.AppointmentStatus)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.Priority)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.ConsultationType)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.ConsultationFee)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.AdditionalCharges)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.DiscountAmount)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.TotalAmount)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.PaymentStatus)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.PaymentMethod)
                   .HasMaxLength(50);

            builder.Property(a => a.InsuranceClaimAmount)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.RoomNumber)
                   .HasMaxLength(20);

            builder.Property(a => a.QueueNumber).IsRequired();
            builder.Property(a => a.EstimatedWaitTime).IsRequired();
            builder.Property(a => a.PatientSatisfactionRating);

            builder.Property(a => a.CreatedAt).IsRequired();
            builder.Property(a => a.UpdatedAt).IsRequired(false);
        }
    }
}
