using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.DeleteList
{
    public sealed class DeleteScrumListCommandHandler : CommandHandlerBase, IRequestHandler<DeleteScrumListCommand>
    {
        private readonly IScrumListRepository _listRepository;
        private readonly IScrumCardRepository _cardRepository;

        public DeleteScrumListCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumListRepository listRepository,
            IScrumCardRepository cardRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _listRepository = listRepository;
            _cardRepository = cardRepository;
        }

        public async Task Handle(DeleteScrumListCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ScrumList? list = await _listRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (list == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"List with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // A column that still holds cards is never deleted: the cards would be lost without anyone choosing that.
            if (await _cardRepository.ExistsAsync(c => c.ListId == request.Id, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Move or delete the cards in this list before deleting it.",
                    DomainErrorCodes.Scrumboard.ListNotEmpty
                ));
                return;
            }

            _listRepository.SoftDeleteSingle(list, false, cancellationToken);

            await CommitAsync();
        }
    }
}
