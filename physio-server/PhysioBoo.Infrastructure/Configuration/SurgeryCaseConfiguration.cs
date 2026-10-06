using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SurgeryCaseConfiguration : IEntityTypeConfiguration<SurgeryCase>
    {
        public void Configure(EntityTypeBuilder<SurgeryCase> builder)
        {
            // Naming
            builder.ToTable("SurgeryCases");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => new { c.TenantId, c.SurgeryNumber }).IsUnique();
            builder.HasIndex(c => new { c.OperatingRoomId, c.ScheduledStart });
            builder.HasIndex(c => c.ScheduledStart);
            builder.HasIndex(c => c.Status);
            builder.HasIndex(c => c.PatientId);

            // Relationships
            builder.HasOne(c => c.Patient)
                   .WithMany()
                   .HasForeignKey(c => c.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Department)
                   .WithMany()
                   .HasForeignKey(c => c.DepartmentId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(c => c.OperatingRoom)
                   .WithMany()
                   .HasForeignKey(c => c.OperatingRoomId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(c => c.SurgeryNumber)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(c => c.Procedure)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.SurgeryType)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(c => c.ScheduledStart)
                   .IsRequired();

            builder.Property(c => c.EstimatedDurationMinutes)
                   .IsRequired();

            builder.Property(c => c.Priority)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.Status)
                   .HasConversion<string>()
                   .HasMaxLength(24)
                   .IsRequired();

            builder.Property(c => c.Diagnosis)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(c => c.ConsentStatus)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.RiskAssessment)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(c => c.Notes)
                   .HasMaxLength(4000);

            builder.Property(c => c.Complications)
                   .HasMaxLength(2000);

            builder.Property(c => c.PacuBay)
                   .HasMaxLength(32);

            builder.Property(c => c.RecoveryStatus)
                   .HasMaxLength(64);

            builder.Property(c => c.PostOpNotes)
                   .HasMaxLength(4000);

            builder.Property(c => c.FollowUpOrders)
                   .HasMaxLength(2000);

            builder.Property(c => c.CancelReason)
                   .HasMaxLength(500);
        }
    }
}
