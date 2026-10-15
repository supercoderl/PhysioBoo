using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Conversations.SendMessage
{
    public sealed class SendConversationMessageCommandValidation : AbstractValidator<SendConversationMessageCommand>
    {
        public SendConversationMessageCommandValidation()
        {
            RuleFor(c => c.ConversationId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Conversation.EmptyId).WithMessage("Conversation may not be empty.");

            RuleFor(c => c.Message.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Conversation.EmptyMessageId).WithMessage("Message id may not be empty.");

            RuleFor(c => c.Message.Content)
                .Must(content => !string.IsNullOrWhiteSpace(content))
                .WithErrorCode(DomainErrorCodes.Conversation.EmptyContent).WithMessage("A message may not be empty.");

            RuleFor(c => c.Message.Content)
                .Must(content => content!.Trim().Length <= ConversationAccess.MaxContentLength)
                .WithErrorCode(DomainErrorCodes.Conversation.ContentExceedsMaxLength)
                .WithMessage($"A message may not exceed {ConversationAccess.MaxContentLength} characters.")
                .When(c => c.Message.Content != null);
        }
    }
}
