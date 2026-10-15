using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Commands.Conversations;
using PhysioBoo.Application.ViewModels.Conversations;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Conversations.GetMessages
{
    public sealed class GetConversationMessagesQueryHandler : IRequestHandler<GetConversationMessagesQuery, ConversationMessagesViewModel?>
    {
        private const int DefaultLimit = 30;
        private const int MaxLimit = 100;
        private const int MaxNewMessages = 200;

        // CreatedAt is stamped before the insert commits, so a message can become visible slightly after a newer one.
        // Polling "after" therefore looks back a little and the client drops the ids it already has.
        private static readonly TimeSpan AfterOverlap = TimeSpan.FromSeconds(5);

        private readonly IConversationParticipantRepository _participantRepository;
        private readonly IConversationMessageRepository _messageRepository;
        private readonly IMediatorHandler _bus;
        private readonly IUser _user;

        public GetConversationMessagesQueryHandler(
            IConversationParticipantRepository participantRepository,
            IConversationMessageRepository messageRepository,
            IMediatorHandler bus,
            IUser user
        )
        {
            _participantRepository = participantRepository;
            _messageRepository = messageRepository;
            _bus = bus;
            _user = user;
        }

        public async Task<ConversationMessagesViewModel?> Handle(GetConversationMessagesQuery request, CancellationToken ct)
        {
            Guid me = _user.GetUserId();
            Guid conversationId = request.ConversationId;

            if (!await ConversationAccess.IsParticipantAsync(_participantRepository, conversationId, me, ct))
            {
                await NotifyAsync($"Conversation with id {conversationId} doesn't exist.", ErrorCodes.ObjectNotFound);
                return null;
            }

            IQueryable<ConversationMessage> messages = _messageRepository.GetAllNoTracking(m => m.ConversationId == conversationId);

            Guid? cursorId = request.After ?? request.Before;
            DateTime? cursorAt = null;
            if (cursorId.HasValue)
            {
                cursorAt = await messages
                    .Where(m => m.Id == cursorId.Value)
                    .Select(m => (DateTime?)m.CreatedAt)
                    .FirstOrDefaultAsync(ct);

                if (!cursorAt.HasValue)
                {
                    await NotifyAsync("The message cursor does not belong to this conversation.", DomainErrorCodes.Conversation.InvalidCursor);
                    return null;
                }
            }

            List<ConversationMessage> items;
            bool hasMore = false;

            if (request.After.HasValue)
            {
                DateTime from = cursorAt!.Value - AfterOverlap;
                Guid anchorId = request.After.Value;

                items = await messages
                    .Where(m => m.CreatedAt >= from && m.Id != anchorId)
                    .OrderBy(m => m.CreatedAt).ThenBy(m => m.Id)
                    .Take(MaxNewMessages)
                    .ToListAsync(ct);
            }
            else
            {
                int limit = Math.Clamp(request.Limit ?? DefaultLimit, 1, MaxLimit);

                if (request.Before.HasValue)
                {
                    DateTime before = cursorAt!.Value;
                    Guid anchorId = request.Before.Value;

                    // Keyset paging on (CreatedAt, Id) so equal timestamps are neither skipped nor repeated.
                    messages = messages.Where(m =>
                        m.CreatedAt < before || (m.CreatedAt == before && m.Id.CompareTo(anchorId) < 0));
                }

                List<ConversationMessage> page = await messages
                    .OrderByDescending(m => m.CreatedAt).ThenByDescending(m => m.Id)
                    .Take(limit + 1)
                    .ToListAsync(ct);

                hasMore = page.Count > limit;
                items = page.Take(limit).Reverse().ToList();
            }

            return new ConversationMessagesViewModel
            {
                ConversationId = conversationId,
                Items = items.Select(m => ConversationMessageViewModel.FromEntity(m, me)).ToList(),
                HasMore = hasMore
            };
        }

        private Task NotifyAsync(string message, string code)
        {
            return _bus.RaiseEventAsync(new DomainNotification(nameof(GetConversationMessagesQuery), message, code));
        }
    }
}
