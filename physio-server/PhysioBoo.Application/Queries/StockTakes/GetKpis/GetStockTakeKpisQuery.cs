
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetKpis
{
    public sealed record GetStockTakeKpisQuery() : IRequest<StockTakeKpisViewModel>;
}
