namespace PhysioBoo.Domain.Entities.Workspace
{
    // One chat message. Messages are append-only; the id is chosen by the sending client so a retried send is not stored twice.
    public class ConversationMessage : TenantEntity
    {
        #region Core Message Table (3)
        public Guid ConversationId { get; private set; }
        public Guid SenderUserId { get; private set; }
        public string Content { get; private set; }

        public virtual Conversation? Conversation { get; private set; }
        #endregion

        #region Constructor (3)
        public ConversationMessage(Guid id, Guid conversationId, Guid senderUserId, string content) : base(id)
        {
            ConversationId = conversationId;
            SenderUserId = senderUserId;
            Content = content;
        }
        #endregion
    }
}
