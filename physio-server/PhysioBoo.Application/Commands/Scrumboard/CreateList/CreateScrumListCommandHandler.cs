using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Scrumboard;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateList
{
    public sealed class CreateScrumListCommandHandler : CommandHandlerBase, IRequestHandler<CreateScrumListCommand>
    {
        private readonly IScrumBoardRepository _boardRepository;
        private readonly IScrumListRepository _listRepository;
        private readonly IUser _user;

        public CreateScrumListCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumBoardRepository boardRepository,
            IScrumListRepository listRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _user = user;
        }

        public async Task Handle(CreateScrumListCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _boardRepository.ExistsAsync(request.BoardId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Board with id {request.BoardId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // New columns go to the right. Two people adding at once may share a position; ordering stays stable.
            int? last = await _listRepository
                .GetAllNoTracking(l => l.BoardId == request.BoardId)
                .MaxAsync(l => (int?)l.Position, cancellationToken);

            ScrumList list = new ScrumList(request.NewId, request.BoardId, request.Input.Title.Trim(), (last ?? -1) + 1);
            list.SetTenantId(_user.GetTenantId());
            list.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _listRepository.InsertAsync<ScrumList, Guid>(list);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create list: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = ScrumListViewModel.FromEntity(list);
        }
    }
}
