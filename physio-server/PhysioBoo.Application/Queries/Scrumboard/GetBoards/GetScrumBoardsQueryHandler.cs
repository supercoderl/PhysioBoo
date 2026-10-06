using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Scrumboard;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Scrumboard.GetBoards
{
    public sealed class GetScrumBoardsQueryHandler : IRequestHandler<GetScrumBoardsQuery, List<ScrumBoardSummaryViewModel>>
    {
        private readonly IScrumBoardRepository _boardRepository;
        private readonly IScrumListRepository _listRepository;
        private readonly IScrumCardRepository _cardRepository;

        public GetScrumBoardsQueryHandler(
            IScrumBoardRepository boardRepository,
            IScrumListRepository listRepository,
            IScrumCardRepository cardRepository
        )
        {
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
        }

        public async Task<List<ScrumBoardSummaryViewModel>> Handle(GetScrumBoardsQuery request, CancellationToken cancellationToken)
        {
            List<ScrumBoard> boards = await _boardRepository.GetAllNoTracking().ToListAsync(cancellationToken);

            // Two grouped counts for all boards, instead of two queries per board.
            Dictionary<Guid, int> listCounts = await _listRepository.GetAllNoTracking()
                .GroupBy(l => l.BoardId)
                .Select(g => new { BoardId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.BoardId, x => x.Count, cancellationToken);

            Dictionary<Guid, int> cardCounts = await _cardRepository.GetAllNoTracking()
                .GroupBy(c => c.BoardId)
                .Select(g => new { BoardId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.BoardId, x => x.Count, cancellationToken);

            return boards
                .Select(b => ScrumBoardSummaryViewModel.FromEntity(
                    b,
                    listCounts.GetValueOrDefault(b.Id),
                    cardCounts.GetValueOrDefault(b.Id)))
                .OrderByDescending(b => b.UpdatedAt)
                .ToList();
        }
    }
}
