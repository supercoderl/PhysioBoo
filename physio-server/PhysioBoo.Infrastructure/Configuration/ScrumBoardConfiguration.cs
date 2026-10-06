using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ScrumBoardConfiguration : IEntityTypeConfiguration<ScrumBoard>
    {
        public void Configure(EntityTypeBuilder<ScrumBoard> builder)
        {
            // Naming
            builder.ToTable("ScrumBoards");

            // PK
            builder.HasKey(b => b.Id);

            // Indexes
            builder.HasIndex(b => b.TenantId);

            // Relationships
            // (none: lists and cards point at the board)

            // Properties
            builder.Property(b => b.Title)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(b => b.Description)
                   .HasMaxLength(500);
        }
    }
}
