
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetItems
{
    public sealed record GetStockTakeItemsQuery(Guid StockTakeId, Guid? CategoryId, string? Search) : IRequest<List<StockTakeItemViewModel>>;
}
