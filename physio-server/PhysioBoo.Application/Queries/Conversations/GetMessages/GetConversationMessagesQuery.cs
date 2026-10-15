using PhysioBoo.Application.ViewModels.Conversations;

namespace PhysioBoo.Application.Queries.Conversations.GetMessages
{
    // Without a cursor: the newest page. Before: the page of older messages ahead of that message.
    // After: messages newer than that message (used to poll for new ones).
    public sealed record GetConversationMessagesQuery(Guid ConversationId, Guid? Before, Guid? After, int? Limit)
        : IRequest<ConversationMessagesViewModel?>;
}
