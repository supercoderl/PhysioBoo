using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetBatchById
{
    public sealed record GetWarehouseBatchByIdQuery(Guid BatchId) : IRequest<WarehouseBatchViewModel?>;
}
