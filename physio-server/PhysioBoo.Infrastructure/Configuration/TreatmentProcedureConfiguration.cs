using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class TreatmentProcedureConfiguration : IEntityTypeConfiguration<TreatmentProcedure>
    {
        public void Configure(EntityTypeBuilder<TreatmentProcedure> builder)
        {
            // Naming
            builder.ToTable("TreatmentProcedures");

            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => new { p.PatientId, p.ScheduledAt });

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(p => p.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(p => p.PatientId)
                   .IsRequired();

            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(p => p.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(p => p.Department)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(p => p.ScheduledAt)
                   .IsRequired();

            builder.Property(p => p.CompletedAt);

            builder.Property(p => p.PerformerName)
                   .HasMaxLength(120);
        }
    }
}
