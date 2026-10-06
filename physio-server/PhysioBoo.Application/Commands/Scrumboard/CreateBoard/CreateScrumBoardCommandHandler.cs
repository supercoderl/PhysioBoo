using PhysioBoo.Application.ViewModels.Scrumboard;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateBoard
{
    public sealed class CreateScrumBoardCommandHandler : CommandHandlerBase, IRequestHandler<CreateScrumBoardCommand>
    {
        private readonly IScrumBoardRepository _boardRepository;
        private readonly IUser _user;

        public CreateScrumBoardCommandHandler(
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

        public async Task Handle(CreateScrumBoardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string? description = string.IsNullOrWhiteSpace(request.Input.Description) ? null : request.Input.Description.Trim();

            ScrumBoard board = new ScrumBoard(request.NewId, request.Input.Title.Trim(), description);
            board.SetTenantId(_user.GetTenantId());
            board.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _boardRepository.InsertAsync<ScrumBoard, Guid>(board);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create board: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = ScrumBoardSummaryViewModel.FromEntity(board, 0, 0);
        }
    }
}
