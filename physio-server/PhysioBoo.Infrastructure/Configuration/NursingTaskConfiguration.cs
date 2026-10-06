using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class NursingTaskConfiguration : IEntityTypeConfiguration<NursingTask>
    {
        public void Configure(EntityTypeBuilder<NursingTask> builder)
        {
            // Naming
            builder.ToTable("NursingTasks");

            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => new { t.PatientId, t.Status, t.DueAt });

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(t => t.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(t => t.PatientId)
                   .IsRequired();

            builder.Property(t => t.Label)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(t => t.DueAt)
                   .IsRequired();

            builder.Property(t => t.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(t => t.AssignedNurseName)
                   .HasMaxLength(120);

            builder.Property(t => t.CompletedAt);
        }
    }
}
