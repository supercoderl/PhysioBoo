using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class NoteConfiguration : IEntityTypeConfiguration<Note>
    {
        public void Configure(EntityTypeBuilder<Note> builder)
        {
            // Naming
            builder.ToTable("Notes");

            // PK
            builder.HasKey(n => n.Id);

            // Indexes: every list is "this owner's notes", newest first
            builder.HasIndex(n => new { n.OwnerUserId, n.IsArchived, n.UpdatedAt });

            // Relationships
            // (none: OwnerUserId is a plain reference to the signed-in user)

            // Properties
            builder.Property(n => n.OwnerUserId)
                   .IsRequired();

            builder.Property(n => n.Title)
                   .HasMaxLength(200);

            builder.Property(n => n.Content)
                   .IsRequired()
                   .HasMaxLength(10000);

            builder.Property(n => n.LabelsJson)
                   .IsRequired()
                   .HasMaxLength(2000);

            builder.Property(n => n.ChecklistJson)
                   .IsRequired()
                   .HasMaxLength(8000);

            builder.Property(n => n.IsPinned)
                   .IsRequired();

            builder.Property(n => n.IsArchived)
                   .IsRequired();
        }
    }
}
