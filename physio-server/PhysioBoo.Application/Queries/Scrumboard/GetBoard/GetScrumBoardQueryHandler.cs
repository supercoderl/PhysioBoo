using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Scrumboard;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Scrumboard.GetBoard
{
    public sealed class GetScrumBoardQueryHandler : IRequestHandler<GetScrumBoardQuery, ScrumBoardViewModel?>
    {
        private readonly IScrumBoardRepository _boardRepository;
        private readonly IScrumListRepository _listRepository;
        private readonly IScrumCardRepository _cardRepository;
        private readonly IMediatorHandler _bus;
        private readonly IUser _user;

        public GetScrumBoardQueryHandler(
            IScrumBoardRepository boardRepository,
            IScrumListRepository listRepository,
            IScrumCardRepository cardRepository,
            IMediatorHandler bus,
            IUser user
        )
        {
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _bus = bus;
            _user = user;
        }

        public async Task<ScrumBoardViewModel?> Handle(GetScrumBoardQuery request, CancellationToken cancellationToken)
        {
            ScrumBoard? board = await _boardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (board == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetScrumBoardQuery),
                    $"Board with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            List<ScrumList> lists = await _listRepository
                .GetAllNoTracking(l => l.BoardId == request.Id, orderBy: q => q.OrderBy(l => l.Position))
                .ToListAsync(cancellationToken);

            List<ScrumCard> cards = await _cardRepository
                .GetAllNoTracking(c => c.BoardId == request.Id)
                .ToListAsync(cancellationToken);

            ILookup<Guid, ScrumCard> cardsByList = cards.ToLookup(c => c.ListId);

            return new ScrumBoardViewModel
            {
                Id = board.Id,
                Title = board.Title,
                Description = board.Description,
                CanDelete = board.CreatedBy == _user.GetUserId(),
                Lists = lists.Select(l => ScrumListViewModel.FromEntity(l, cardsByList[l.Id])).ToList()
            };
        }
    }
}
