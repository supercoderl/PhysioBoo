using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
    {
        public void Configure(EntityTypeBuilder<Conversation> builder)
        {
            // Naming
            builder.ToTable("Conversations");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes: one direct thread per pair of members in a tenant
            builder.HasIndex(c => new { c.TenantId, c.DirectKey })
                   .IsUnique()
                   .HasFilter("\"DirectKey\" IS NOT NULL");

            // Relationships
            builder.HasOne<Domain.Entities.Core.User>()
                   .WithMany()
                   .HasForeignKey(c => c.LastMessageSenderId);

            // Properties
            builder.Property(c => c.DirectKey)
                   .HasMaxLength(65);

            builder.Property(c => c.LastMessagePreview)
                   .HasMaxLength(200);
        }
    }
}
