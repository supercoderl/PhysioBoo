using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PatientAllergyConfiguration : IEntityTypeConfiguration<PatientAllergy>
    {
        public void Configure(EntityTypeBuilder<PatientAllergy> builder)
        {
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

            // Properties
            builder.Property(a => a.AllergenName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(a => a.AllergenType)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(a => a.ReactionType)
                   .HasMaxLength(100);

            builder.Property(a => a.Severity)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(a => a.FirstOccurenceDate);
            builder.Property(a => a.LastOccurenceDate);

            builder.Property(a => a.TreatmentGiven);
            builder.Property(a => a.Notes);

            builder.Property(a => a.IsActive)
                   .IsRequired();

            builder.Property(a => a.CreatedAt)
                   .IsRequired();
        }
    }
}
