

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrescriptionClinicalWarningConfiguration : IEntityTypeConfiguration<PrescriptionClinicalWarning>
    {
        public void Configure(EntityTypeBuilder<PrescriptionClinicalWarning> builder)
        {
            // Naming
            builder.ToTable("PrescriptionClinicalWarnings");

            // PK
            builder.HasKey(w => w.Id);

            // Indexes
            builder.HasIndex(w => w.PrescriptionItemId);

            // Relationships
            builder.HasOne(w => w.PrescriptionItem)
                   .WithMany(i => i.PrescriptionClinicalWarnings)
                   .HasForeignKey(w => w.PrescriptionItemId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(w => w.AcknowledgedByUser)
                   .WithMany(u => u.AcknowledgedPrescriptionClinicalWarnings)
                   .HasForeignKey(w => w.AcknowledgedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.Creator)
                   .WithMany(u => u.CreatedPrescriptionClinicalWarnings)
                   .HasForeignKey(w => w.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.Updater)
                   .WithMany(u => u.UpdatedPrescriptionClinicalWarnings)
                   .HasForeignKey(w => w.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.HospitalGroup)
                   .WithMany(hg => hg.PrescriptionClinicalWarnings)
                   .HasForeignKey(w => w.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(w => w.Type)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(w => w.Severity)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(w => w.Message)
                   .IsRequired();

            builder.Property(w => w.RecommendedAction);
            builder.Property(w => w.AcknowledgedAt);
        }
    }
}
