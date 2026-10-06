using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SurgeryChecklistItemConfiguration : IEntityTypeConfiguration<SurgeryChecklistItem>
    {
        public void Configure(EntityTypeBuilder<SurgeryChecklistItem> builder)
        {
            // Naming
            builder.ToTable("SurgeryChecklistItems");

            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => new { i.SurgeryCaseId, i.SortOrder });

            // Relationships
            builder.HasOne(i => i.SurgeryCase)
                   .WithMany(c => c.Checklist)
                   .HasForeignKey(i => i.SurgeryCaseId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(i => i.Label)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(i => i.SortOrder)
                   .IsRequired();

            builder.Property(i => i.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(i => i.SignedByName)
                   .HasMaxLength(120);

            builder.Property(i => i.SignedAt);
        }
    }
}
