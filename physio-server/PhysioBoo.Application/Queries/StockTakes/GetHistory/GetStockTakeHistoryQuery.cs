
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetHistory
{
    public sealed record GetStockTakeHistoryQuery(Guid StockTakeId) : IRequest<List<StockTakeActivityViewModel>>;
}
