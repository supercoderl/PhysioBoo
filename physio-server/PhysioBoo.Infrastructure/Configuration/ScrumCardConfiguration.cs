using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ScrumCardConfiguration : IEntityTypeConfiguration<ScrumCard>
    {
        public void Configure(EntityTypeBuilder<ScrumCard> builder)
        {
            // Naming
            builder.ToTable("ScrumCards");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.BoardId);
            builder.HasIndex(c => new { c.ListId, c.Position });

            // Relationships
            builder.HasOne<ScrumBoard>()
                   .WithMany()
                   .HasForeignKey(c => c.BoardId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ScrumList>()
                   .WithMany()
                   .HasForeignKey(c => c.ListId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(c => c.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(c => c.Description)
                   .HasMaxLength(4000);

            builder.Property(c => c.Position)
                   .IsRequired();
        }
    }
}
