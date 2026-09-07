
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetInventoryHistory
{
    public sealed record GetInventoryHistoryQuery(Guid MedicineId, StockMovementType? Type) : IRequest<List<InventoryHistoryEntryViewModel>>;
}
