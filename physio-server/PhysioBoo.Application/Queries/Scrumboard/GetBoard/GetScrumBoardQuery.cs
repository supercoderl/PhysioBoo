using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Queries.Scrumboard.GetBoard
{
    public sealed record GetScrumBoardQuery(Guid Id) : IRequest<ScrumBoardViewModel?>;
}
