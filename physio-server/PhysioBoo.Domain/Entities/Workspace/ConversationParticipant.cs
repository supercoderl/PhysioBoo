namespace PhysioBoo.Domain.Entities.Workspace
{
    // A member of a conversation. Messages created after LastReadAt (and not sent by this member) are unread.
    public class ConversationParticipant : TenantEntity
    {
        #region Core Participant Table (3)
        public Guid ConversationId { get; private set; }
        public Guid UserId { get; private set; }
        public DateTime? LastReadAt { get; private set; }

        public virtual Conversation? Conversation { get; private set; }
        #endregion

        #region Constructor (3)
        public ConversationParticipant(Guid id, Guid conversationId, Guid userId) : base(id)
        {
            ConversationId = conversationId;
            UserId = userId;
        }
        #endregion
    }
}
