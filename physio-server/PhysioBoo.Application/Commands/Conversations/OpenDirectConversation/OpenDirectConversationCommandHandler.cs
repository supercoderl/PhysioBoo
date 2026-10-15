using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Conversations.OpenDirectConversation
{
    public sealed class OpenDirectConversationCommandHandler : CommandHandlerBase, IRequestHandler<OpenDirectConversationCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConversationRepository _conversationRepository;
        private readonly IConversationParticipantRepository _participantRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUser _user;

        public OpenDirectConversationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IConversationRepository conversationRepository,
            IConversationParticipantRepository participantRepository,
            IUserRepository userRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _unitOfWork = unitOfWork;
            _conversationRepository = conversationRepository;
            _participantRepository = participantRepository;
            _userRepository = userRepository;
            _user = user;
        }

        public Task Handle(OpenDirectConversationCommand request, CancellationToken cancellationToken)
            => _unitOfWork.ExecuteInStrategyAsync(() => HandleCore(request, cancellationToken));

        private async Task HandleCore(OpenDirectConversationCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Guid me = _user.GetUserId();
            Guid contactId = request.ContactUserId;

            if (contactId == me)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "You cannot start a conversation with yourself.",
                    DomainErrorCodes.Conversation.CannotMessageSelf
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

            // The global tenant filter hides users of other tenants, so they fail this check too.
            if (!await ConversationAccess.IsTeamMemberAsync(_userRepository, contactId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This contact is not an active member of your team.",
                    DomainErrorCodes.Conversation.InvalidContact
                ));
                return;
            }

            string directKey = Conversation.BuildDirectKey(me, contactId);

            Guid? existingId = await FindByDirectKeyAsync(directKey, cancellationToken);
            if (existingId.HasValue)
            {
                request.Result = existingId;
                return;
            }

            Guid tenantId = _user.GetTenantId();
            Conversation conversation = new Conversation(Guid.NewGuid(), directKey);
            conversation.SetTenantId(tenantId);
            conversation.SetCreatedBy(me);

            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            SharedKernel.Results.DbResult<Guid> inserted = await _conversationRepository.InsertAsync<Conversation, Guid>(conversation);
            if (!inserted.Success)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);

                // Both members opened the chat at the same moment: the unique DirectKey let only one insert win.
                Guid? winnerId = await FindByDirectKeyAsync(directKey, cancellationToken);
                if (winnerId.HasValue)
                {
                    request.Result = winnerId;
                    return;
                }

                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to start the conversation: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            foreach (Guid userId in new[] { me, contactId })
            {
                ConversationParticipant participant = new ConversationParticipant(Guid.NewGuid(), conversation.Id, userId);
                participant.SetTenantId(tenantId);
                participant.SetCreatedBy(me);

                SharedKernel.Results.DbResult<Guid> added = await _participantRepository.InsertAsync<ConversationParticipant, Guid>(participant);
                if (!added.Success)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Failed to start the conversation: {added.Error}",
                        ErrorCodes.CommitFailed
                    ));
                    return;
                }
            }

            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            request.Result = conversation.Id;
        }

        private async Task<Guid?> FindByDirectKeyAsync(string directKey, CancellationToken ct)
        {
            return await _conversationRepository
                .GetAllNoTracking(c => c.DirectKey == directKey)
                .Select(c => (Guid?)c.Id)
                .FirstOrDefaultAsync(ct);
        }
    }
}
