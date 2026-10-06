using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ScrumListConfiguration : IEntityTypeConfiguration<ScrumList>
    {
        public void Configure(EntityTypeBuilder<ScrumList> builder)
        {
            // Naming
            builder.ToTable("ScrumLists");

            // PK
            builder.HasKey(l => l.Id);

            // Indexes
            builder.HasIndex(l => new { l.BoardId, l.Position });

            // Relationships
            builder.HasOne<ScrumBoard>()
                   .WithMany()
                   .HasForeignKey(l => l.BoardId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(l => l.Title)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(l => l.Position)
                   .IsRequired();
        }
    }
}
