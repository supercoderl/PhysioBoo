namespace PhysioBoo.Application.Commands.Conversations.MarkRead
{
    // Marks the conversation as read up to (and including) MessageId for the signed-in user.
    public sealed class MarkConversationReadCommand : CommandBase, IRequest
    {
        private static readonly MarkConversationReadCommandValidation s_validation = new();

        public Guid ConversationId { get; }
        public Guid MessageId { get; }

        public MarkConversationReadCommand(Guid conversationId, Guid messageId) : base(conversationId)
        {
            ConversationId = conversationId;
            MessageId = messageId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
