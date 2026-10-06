using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.DeleteBoard
{
    public sealed class DeleteScrumBoardCommandHandler : CommandHandlerBase, IRequestHandler<DeleteScrumBoardCommand>
    {
        private readonly IScrumBoardRepository _boardRepository;
        private readonly IUser _user;

        public DeleteScrumBoardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumBoardRepository boardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _boardRepository = boardRepository;
            _user = user;
        }

        public async Task Handle(DeleteScrumBoardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ScrumBoard? board = await _boardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (board == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Board with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // The board is shared, so only the person who created it can remove it for everyone.
            if (board.CreatedBy != _user.GetUserId())
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Only the creator of a board can delete it.",
                    DomainErrorCodes.Scrumboard.NotBoardCreator
                ));
                return;
            }

            // Soft delete: the board disappears from every list, and its columns and cards are unreachable with it.
            _boardRepository.SoftDeleteSingle(board, false, cancellationToken);

            await CommitAsync();
        }
    }
}
