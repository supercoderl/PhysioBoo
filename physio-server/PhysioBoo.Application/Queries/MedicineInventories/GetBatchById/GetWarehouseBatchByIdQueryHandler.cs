using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetBatchById
{
    public sealed class GetWarehouseBatchByIdQueryHandler : IRequestHandler<GetWarehouseBatchByIdQuery, WarehouseBatchViewModel?>
    {
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public GetWarehouseBatchByIdQueryHandler(IMedicineInventoryRepository inventoryRepository)
        {
            _inventoryRepository = inventoryRepository;
        }

        public async Task<WarehouseBatchViewModel?> Handle(GetWarehouseBatchByIdQuery request, CancellationToken ct)
        {
            MedicineInventory? batch = await _inventoryRepository
                .GetAllNoTracking(b => b.Id == request.BatchId, includeProperties: "Supplier")
                .FirstOrDefaultAsync(ct);

            return batch == null ? null : WarehouseBatchViewModel.FromEntity(batch);
        }
    }
}
