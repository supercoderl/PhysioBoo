
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.StockTakes.Search
{
    public sealed record SearchStockTakesQuery(PagedRequest<StockTakeFilter> Request) : IRequest<PagedResult<StockTakeViewModel>>;
}
