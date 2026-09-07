
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetWarehouses
{
    public sealed record GetWarehousesQuery() : IRequest<List<WarehouseLookupViewModel>>;
}
