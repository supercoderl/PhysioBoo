using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Conversations.MarkRead
{
    public sealed class MarkConversationReadCommandValidation : AbstractValidator<MarkConversationReadCommand>
    {
        public MarkConversationReadCommandValidation()
        {
            RuleFor(c => c.ConversationId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Conversation.EmptyId).WithMessage("Conversation may not be empty.");

            RuleFor(c => c.MessageId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Conversation.EmptyMessageId).WithMessage("Message id may not be empty.");
        }
    }
}
