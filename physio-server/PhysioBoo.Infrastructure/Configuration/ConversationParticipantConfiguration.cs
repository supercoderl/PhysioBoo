using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ConversationParticipantConfiguration : IEntityTypeConfiguration<ConversationParticipant>
    {
        public void Configure(EntityTypeBuilder<ConversationParticipant> builder)
        {
            // Naming
            builder.ToTable("ConversationParticipants");

            // PK
            builder.HasKey(p => p.Id);

            // Indexes: a user joins a conversation once; the contact list starts from "my memberships"
            builder.HasIndex(p => new { p.ConversationId, p.UserId })
                   .IsUnique();

            builder.HasIndex(p => p.UserId);

            // Relationships
            builder.HasOne(p => p.Conversation)
                   .WithMany(c => c.Participants)
                   .HasForeignKey(p => p.ConversationId)
                   .IsRequired();

            builder.HasOne<Domain.Entities.Core.User>()
                   .WithMany()
                   .HasForeignKey(p => p.UserId)
                   .IsRequired();
        }
    }
}
