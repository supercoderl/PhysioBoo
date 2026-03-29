using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PatientAllergyConfiguration : IEntityTypeConfiguration<PatientAllergy>
    {
        public void Configure(EntityTypeBuilder<PatientAllergy> builder)
        {
            // Naming
            builder.ToTable("PatientAllergies");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => a.PatientId);
            builder.HasIndex(a => a.AllergenName);

            // Relationships
            builder.HasOne(a => a.Patient)
                   .WithMany(p => p.Allergies)
                   .HasForeignKey(a => a.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Creator)
                   .WithMany(u => u.CreatedPatientAllergies)
                   .HasForeignKey(a => a.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Updater)
                   .WithMany(u => u.UpdatedPatientAllergies)
                   .HasForeignKey(a => a.UpdatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.HospitalGroup)
                   .WithMany(hg => hg.PatientAllergies)
                   .HasForeignKey(a => a.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(a => a.AllergenName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(a => a.AllergenType)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.ReactionType)
                   .HasMaxLength(100);

            builder.Property(a => a.Severity)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.FirstOccurenceDate);
            builder.Property(a => a.LastOccurenceDate);

            builder.Property(a => a.TreatmentGiven);
            builder.Property(a => a.Notes);

            builder.Property(a => a.IsActive)
                   .IsRequired();
        }
    }
}
