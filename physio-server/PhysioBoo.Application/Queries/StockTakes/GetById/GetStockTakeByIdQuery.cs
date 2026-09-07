
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetById
{
    public sealed record GetStockTakeByIdQuery(Guid Id) : IRequest<StockTakeViewModel?>;
}
