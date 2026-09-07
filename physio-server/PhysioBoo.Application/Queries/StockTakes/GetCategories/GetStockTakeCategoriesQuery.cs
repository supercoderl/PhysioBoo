
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetCategories
{
    public sealed record GetStockTakeCategoriesQuery(Guid StockTakeId) : IRequest<List<StockTakeCategoryNodeViewModel>>;
}
