namespace PhysioBoo.Application.Commands.Conversations.OpenDirectConversation
{
    // Returns the direct conversation between the signed-in user and ContactUserId, creating it the first time.
    public sealed class OpenDirectConversationCommand : CommandBase, IRequest
    {
        private static readonly OpenDirectConversationCommandValidation s_validation = new();

        public Guid ContactUserId { get; }

        // Filled by the handler so the endpoint can return the conversation id.
        public Guid? Result { get; set; }

        public OpenDirectConversationCommand(Guid contactUserId) : base(Guid.NewGuid())
        {
            ContactUserId = contactUserId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
