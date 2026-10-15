using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Application.ViewModels.Conversations
{
    public sealed class ConversationMessageViewModel
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderUserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // Worked out on the server from the signed-in user, so the client never decides who sent what.
        public bool IsMine { get; set; }

        public static ConversationMessageViewModel FromEntity(ConversationMessage entity, Guid currentUserId)
        {
            return new ConversationMessageViewModel
            {
                Id = entity.Id,
                ConversationId = entity.ConversationId,
                SenderUserId = entity.SenderUserId,
                Content = entity.Content,
                CreatedAt = entity.CreatedAt,
                IsMine = entity.SenderUserId == currentUserId
            };
        }
    }

    // A slice of a conversation's history, oldest first. HasMore means older messages exist before the first item.
    public sealed class ConversationMessagesViewModel
    {
        public Guid ConversationId { get; set; }
        public List<ConversationMessageViewModel> Items { get; set; } = new();
        public bool HasMore { get; set; }
    }
}
