using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ConversationMessageConfiguration : IEntityTypeConfiguration<ConversationMessage>
    {
        public void Configure(EntityTypeBuilder<ConversationMessage> builder)
        {
            // Naming
            builder.ToTable("ConversationMessages", t =>
                t.HasCheckConstraint("CK_ConversationMessages_Content_NotBlank", "length(btrim(\"Content\")) > 0"));

            // PK
            builder.HasKey(m => m.Id);

            // Indexes: history is read newest-first per conversation, paged by (CreatedAt, Id)
            builder.HasIndex(m => new { m.ConversationId, m.CreatedAt, m.Id });

            builder.HasIndex(m => m.SenderUserId);

            // Relationships
            builder.HasOne(m => m.Conversation)
                   .WithMany(c => c.Messages)
                   .HasForeignKey(m => m.ConversationId)
                   .IsRequired();

            builder.HasOne<Domain.Entities.Core.User>()
                   .WithMany()
                   .HasForeignKey(m => m.SenderUserId)
                   .IsRequired();

            // Properties
            builder.Property(m => m.Content)
                   .IsRequired()
                   .HasMaxLength(2000);
        }
    }
}
