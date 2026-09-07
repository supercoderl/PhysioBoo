
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetStockMovements
{
    public sealed record GetStockMovementsQuery(int PageNumber, int PageSize) : IRequest<PagedResult<StockMovementViewModel>>;
}
