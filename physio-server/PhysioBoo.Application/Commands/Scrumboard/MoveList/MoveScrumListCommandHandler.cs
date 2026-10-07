using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.MoveList
{
    /// <summary>Moves a column to a new position on its board; every column of the board is renumbered 0..n-1.</summary>
    public sealed class MoveScrumListCommandHandler : CommandHandlerBase, IRequestHandler<MoveScrumListCommand>
    {
        private readonly IScrumListRepository _listRepository;
        private readonly IUser _user;

        public MoveScrumListCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumListRepository listRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _listRepository = listRepository;
            _user = user;
        }

        public async Task Handle(MoveScrumListCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Guid? boardId = await _listRepository.GetAllNoTracking(l => l.Id == request.Id).Select(l => (Guid?)l.BoardId).FirstOrDefaultAsync(cancellationToken);
            if (boardId == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"List with id {request.Id} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            List<ScrumList> lists = await _listRepository
                .GetAll(l => l.BoardId == boardId.Value).AsTracking()
                .OrderBy(l => l.Position)
                .ToListAsync(cancellationToken);

            ScrumList moving = lists.Single(l => l.Id == request.Id);
            lists.Remove(moving);
            lists.Insert(Math.Clamp(request.Input.TargetIndex, 0, lists.Count), moving);

            Guid userId = _user.GetUserId();
            for (int i = 0; i < lists.Count; i++)
            {
                if (lists[i].Position == i) continue;
                lists[i].SetPosition(i);
                lists[i].SetUpdatedBy(userId);
            }

            // One SaveChanges, so the renumbering is atomic.
            await CommitAsync();
        }
    }
}
