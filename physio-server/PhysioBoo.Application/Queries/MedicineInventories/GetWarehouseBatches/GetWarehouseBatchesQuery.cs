
using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetWarehouseBatches
{
    public sealed record GetWarehouseBatchesQuery(Guid MedicineId) : IRequest<List<WarehouseBatchViewModel>>;
}
