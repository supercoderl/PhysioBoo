using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ClinicalNoteConfiguration : IEntityTypeConfiguration<ClinicalNote>
    {
        public void Configure(EntityTypeBuilder<ClinicalNote> builder)
        {
            // Naming
            builder.ToTable("ClinicalNotes");

            // PK
            builder.HasKey(n => n.Id);

            // Indexes
            builder.HasIndex(n => new { n.PatientId, n.CreatedAt });
            builder.HasIndex(n => n.NoteType);

            // Relationships
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(n => n.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(n => n.PatientId)
                   .IsRequired();

            builder.Property(n => n.NoteType)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(n => n.Content)
                   .IsRequired()
                   .HasMaxLength(4000);

            builder.Property(n => n.AuthorName)
                   .IsRequired()
                   .HasMaxLength(120);
        }
    }
}
