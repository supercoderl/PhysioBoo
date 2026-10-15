using PhysioBoo.Application.ViewModels.Conversations;

namespace PhysioBoo.Application.Queries.Conversations.GetContacts
{
    // The signed-in user's colleagues for the team chat: most recent conversation first, then by name.
    public sealed record GetChatContactsQuery() : IRequest<List<ChatContactViewModel>>;
}
