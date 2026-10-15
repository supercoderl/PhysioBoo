namespace PhysioBoo.Domain.Entities.Workspace
{
    // A team chat thread between staff of the same tenant. Only direct (1:1) chats exist today:
    // DirectKey is the two members' ids in a fixed order, so the pair can only ever have one thread.
    // The last-message columns are a denormalised preview so the contact list never scans messages.
    public class Conversation : TenantEntity
    {
        #region Core Conversation Table (4)
        public string? DirectKey { get; private set; }
        public DateTime? LastMessageAt { get; private set; }
        public string? LastMessagePreview { get; private set; }
        public Guid? LastMessageSenderId { get; private set; }

        public virtual ICollection<ConversationParticipant> Participants { get; private set; } = new List<ConversationParticipant>();
        public virtual ICollection<ConversationMessage> Messages { get; private set; } = new List<ConversationMessage>();
        #endregion

        #region Constructor (1)
        public Conversation(Guid id, string? directKey) : base(id)
        {
            DirectKey = directKey;
        }
        #endregion

        public static string BuildDirectKey(Guid a, Guid b)
        {
            return a.CompareTo(b) < 0 ? $"{a:N}:{b:N}" : $"{b:N}:{a:N}";
        }
    }
}
