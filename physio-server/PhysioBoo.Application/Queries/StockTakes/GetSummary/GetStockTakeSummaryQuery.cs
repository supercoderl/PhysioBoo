
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetSummary
{
    public sealed record GetStockTakeSummaryQuery(Guid StockTakeId) : IRequest<StockTakeSummaryViewModel>;
}
