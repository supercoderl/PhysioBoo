using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.MoveCard
{
    public sealed class MoveScrumCardCommandHandler : CommandHandlerBase, IRequestHandler<MoveScrumCardCommand>
    {
        private readonly IScrumCardRepository _cardRepository;
        private readonly IUser _user;

        public MoveScrumCardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumCardRepository cardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _cardRepository = cardRepository;
            _user = user;
        }

        public async Task Handle(MoveScrumCardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            // The reorder (card plus both columns) is one transaction inside the repository.
            SharedKernel.Results.DbResult<Guid> result = await _cardRepository.MoveAsync(
                request.Id,
                request.Input.TargetListId,
                request.Input.TargetIndex,
                _user.GetUserId(),
                cancellationToken
            );

            if (result.Success) return;

            string message = result.Error switch
            {
                ErrorCodes.ObjectNotFound => $"Card with id {request.Id} doesn't exist.",
                DomainErrorCodes.Scrumboard.WrongBoard => "A card can only move to a list of its own board.",
                _ => "Failed to move the card."
            };

            await NotifyAsync(new DomainNotification(request.MessageType, message, result.Error ?? ErrorCodes.CommitFailed));
        }
    }
}
