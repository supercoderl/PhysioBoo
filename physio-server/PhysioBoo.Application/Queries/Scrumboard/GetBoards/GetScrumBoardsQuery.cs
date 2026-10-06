using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Queries.Scrumboard.GetBoards
{
    // Every board of the tenant, most recently changed first.
    public sealed record GetScrumBoardsQuery : IRequest<List<ScrumBoardSummaryViewModel>>;
}
