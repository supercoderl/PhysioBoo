using PhysioBoo.Application.ViewModels.Conversations;

namespace PhysioBoo.Application.Commands.Conversations.SendMessage
{
    public sealed class SendConversationMessageCommand : CommandBase, IRequest
    {
        private static readonly SendConversationMessageCommandValidation s_validation = new();

        public Guid ConversationId { get; }
        public SendConversationMessageViewModel Message { get; }

        // Filled by the handler so the endpoint can return the stored message.
        public ConversationMessageViewModel? Result { get; set; }

        public SendConversationMessageCommand(Guid conversationId, SendConversationMessageViewModel message) : base(conversationId)
        {
            ConversationId = conversationId;
            Message = message;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
