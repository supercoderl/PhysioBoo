using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Conversations.OpenDirectConversation
{
    public sealed class OpenDirectConversationCommandValidation : AbstractValidator<OpenDirectConversationCommand>
    {
        public OpenDirectConversationCommandValidation()
        {
            RuleFor(c => c.ContactUserId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Conversation.EmptyContact).WithMessage("Contact may not be empty.");
        }
    }
}
