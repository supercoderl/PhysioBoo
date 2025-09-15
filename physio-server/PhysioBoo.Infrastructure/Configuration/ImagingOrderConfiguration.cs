using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ImagingOrderConfiguration : IEntityTypeConfiguration<ImagingOrder>
    {
        public void Configure(EntityTypeBuilder<ImagingOrder> builder)
        {
            // PK
            builder.HasKey(o => o.Id);

            // Indexes
            builder.HasIndex(o => o.OrderNumber).IsUnique();
            builder.HasIndex(o => o.PatientId);
            builder.HasIndex(o => o.DoctorId);
            builder.HasIndex(o => o.AppointmentId);
            builder.HasIndex(o => o.HospitalId);
            builder.HasIndex(o => o.ModalityId);

            // Relationships
            builder.HasOne(o => o.Patient)
                   .WithMany(p => p.ImagingOrders)
                   .HasForeignKey(o => o.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Doctor)
                   .WithMany(d => d.ImagingOrders)
                   .HasForeignKey(o => o.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Appointment)
                   .WithMany(a => a.ImagingOrders)
                   .HasForeignKey(o => o.AppointmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Hospital)
                   .WithMany(h => h.ImagingOrders)
                   .HasForeignKey(o => o.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Modality)
                   .WithMany(m => m.ImagingOrders)
                   .HasForeignKey(o => o.ModalityId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Technician)
                   .WithMany(u => u.ImagingOrders)
                   .HasForeignKey(o => o.TechnicianId);

            builder.HasOne(o => o.Radiologist)
                   .WithMany(u => u.RadiologistImagingOrders)
                   .HasForeignKey(o => o.RadiologistId);

            builder.HasOne(o => o.Creator)
                   .WithMany(u => u.CreatedImagingOrders)
                   .HasForeignKey(o => o.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(o => o.OrderNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(o => o.BodyPart)
                   .HasMaxLength(255);

            builder.Property(o => o.ClinicalIndication);
            builder.Property(o => o.ClinicalHistory);
            builder.Property(o => o.ProvisionalDiagnosis);
            builder.Property(o => o.SpecificQuestions);

            builder.Property(o => o.ContrastRequired).IsRequired();

            builder.Property(o => o.ContrastType)
                   .HasMaxLength(100);

            builder.Property(o => o.LabPriority)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(o => o.ScheduledDate);
            builder.Property(o => o.ScheduledTime);

            builder.Property(o => o.EstimatedDuration).IsRequired();
            builder.Property(o => o.PreparationGiven).IsRequired();

            builder.Property(o => o.PatientWeight)
                   .HasColumnType("numeric(5,2)")
                   .IsRequired();

            builder.Property(o => o.PatientHeight)
                   .HasColumnType("numeric(5,2)")
                   .IsRequired();

            builder.Property(o => o.AllergiesNoted);

            builder.Property(o => o.PregnancyStatus)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(o => o.ImplantsPresent).IsRequired();
            builder.Property(o => o.ImplantDetails);

            builder.Property(o => o.Claustrophobia).IsRequired();

            builder.Property(o => o.TotalCost)
                   .HasColumnType("numeric(10,2)")
                   .IsRequired();

            builder.Property(o => o.Status)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(o => o.CreatedAt).IsRequired();
            builder.Property(o => o.UpdatedAt);
        }
    }
}
