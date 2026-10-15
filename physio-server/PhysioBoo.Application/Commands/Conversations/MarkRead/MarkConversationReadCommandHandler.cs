using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Conversations.MarkRead
{
    public sealed class MarkConversationReadCommandHandler : CommandHandlerBase, IRequestHandler<MarkConversationReadCommand>
    {
        private readonly IConversationParticipantRepository _participantRepository;
        private readonly IConversationMessageRepository _messageRepository;
        private readonly IUser _user;

        public MarkConversationReadCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IConversationParticipantRepository participantRepository,
            IConversationMessageRepository messageRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _participantRepository = participantRepository;
            _messageRepository = messageRepository;
            _user = user;
        }

        public async Task Handle(MarkConversationReadCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Guid me = _user.GetUserId();
            Guid conversationId = request.ConversationId;

            if (!await ConversationAccess.IsParticipantAsync(_participantRepository, conversationId, me, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Conversation with id {conversationId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // Read up to the message the reader saw, not "now": a message that arrived after it stays unread.
            DateTime? readUpTo = await _messageRepository
                .GetAllNoTracking(m => m.Id == request.MessageId && m.ConversationId == conversationId)
                .Select(m => (DateTime?)m.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (!readUpTo.HasValue)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "The message does not belong to this conversation.",
                    DomainErrorCodes.Conversation.InvalidCursor
                ));
                return;
            }

            DateTime upTo = readUpTo.Value;

            // Never moves backwards, so an older read receipt arriving late is harmless.
            await _participantRepository.BatchUpdateMultipleAsync(
                p => p.ConversationId == conversationId && p.UserId == me && (p.LastReadAt == null || p.LastReadAt < upTo),
                s => s.SetProperty(p => p.LastReadAt, upTo),
                cancellationToken
            );
        }
    }
}
