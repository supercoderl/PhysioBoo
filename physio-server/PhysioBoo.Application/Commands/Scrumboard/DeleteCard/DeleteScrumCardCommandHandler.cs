using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.DeleteCard
{
    public sealed class DeleteScrumCardCommandHandler : CommandHandlerBase, IRequestHandler<DeleteScrumCardCommand>
    {
        private readonly IScrumCardRepository _cardRepository;

        public DeleteScrumCardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumCardRepository cardRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _cardRepository = cardRepository;
        }

        public async Task Handle(DeleteScrumCardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ScrumCard? card = await _cardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (card == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Card with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // Positions only decide the order, so the gap left behind needs no renumbering.
            _cardRepository.SoftDeleteSingle(card, false, cancellationToken);

            await CommitAsync();
        }
    }
}
