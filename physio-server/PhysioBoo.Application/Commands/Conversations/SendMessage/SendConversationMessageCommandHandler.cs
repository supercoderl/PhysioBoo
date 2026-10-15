using PhysioBoo.Application.ViewModels.Conversations;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Conversations.SendMessage
{
    public sealed class SendConversationMessageCommandHandler : CommandHandlerBase, IRequestHandler<SendConversationMessageCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConversationRepository _conversationRepository;
        private readonly IConversationParticipantRepository _participantRepository;
        private readonly IConversationMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUser _user;

        public SendConversationMessageCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IConversationRepository conversationRepository,
            IConversationParticipantRepository participantRepository,
            IConversationMessageRepository messageRepository,
            IUserRepository userRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _unitOfWork = unitOfWork;
            _conversationRepository = conversationRepository;
            _participantRepository = participantRepository;
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _user = user;
        }

        public async Task Handle(SendConversationMessageCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Guid me = _user.GetUserId();
            Guid conversationId = request.ConversationId;

            // A conversation the caller is not part of is reported as missing, so its existence is not revealed.
            if (!await ConversationAccess.IsParticipantAsync(_participantRepository, conversationId, me, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Conversation with id {conversationId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (!await ConversationAccess.IsTeamMemberAsync(_userRepository, me, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Only staff members can use the team chat.",
                    ErrorCodes.InsufficientPermissions
                ));
                return;
            }

            // A retried send (same client id) returns what was already stored.
            if (await TryReturnExistingAsync(request, me, cancellationToken)) return;

            string content = request.Message.Content!.Trim();
            ConversationMessage message = new ConversationMessage(request.Message.Id, conversationId, me, content);
            message.SetTenantId(_user.GetTenantId());
            message.SetCreatedBy(me);

            DateTime sentAt = message.CreatedAt;
            string preview = ConversationAccess.BuildPreview(content);

            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            SharedKernel.Results.DbResult<Guid> inserted = await _messageRepository.InsertAsync<ConversationMessage, Guid>(message);
            if (!inserted.Success)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);

                // Lost a race with the same retried request.
                if (await TryReturnExistingAsync(request, me, cancellationToken)) return;

                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to send the message: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            // Only move the preview forward, so two messages committing out of order cannot rewind it.
            await _conversationRepository.BatchUpdateMultipleAsync(
                c => c.Id == conversationId && (c.LastMessageAt == null || c.LastMessageAt <= sentAt),
                s => s
                    .SetProperty(c => c.LastMessageAt, sentAt)
                    .SetProperty(c => c.LastMessagePreview, preview)
                    .SetProperty(c => c.LastMessageSenderId, me)
                    .SetProperty(c => c.UpdatedAt, sentAt)
                    .SetProperty(c => c.UpdatedBy, me),
                cancellationToken
            );

            // The sender has obviously read everything up to their own message.
            await _participantRepository.BatchUpdateMultipleAsync(
                p => p.ConversationId == conversationId && p.UserId == me && (p.LastReadAt == null || p.LastReadAt < sentAt),
                s => s.SetProperty(p => p.LastReadAt, sentAt),
                cancellationToken
            );

            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            request.Result = ConversationMessageViewModel.FromEntity(message, me);
        }

        private async Task<bool> TryReturnExistingAsync(SendConversationMessageCommand request, Guid me, CancellationToken ct)
        {
            ConversationMessage? existing = await _messageRepository.GetByIdAsync(request.Message.Id, ct: ct);
            if (existing == null) return false;

            if (existing.ConversationId != request.ConversationId || existing.SenderUserId != me)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This message id is already in use.",
                    DomainErrorCodes.Conversation.DuplicateMessageId
                ));
                return true;
            }

            request.Result = ConversationMessageViewModel.FromEntity(existing, me);
            return true;
        }
    }
}
