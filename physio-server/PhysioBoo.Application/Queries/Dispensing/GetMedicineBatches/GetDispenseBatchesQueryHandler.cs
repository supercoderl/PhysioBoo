using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Dispensing.GetMedicineBatches
{
    public sealed class GetDispenseBatchesQueryHandler : IRequestHandler<GetDispenseBatchesQuery, List<DispenseBatchOptionViewModel>>
    {
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public GetDispenseBatchesQueryHandler(IMedicineInventoryRepository inventoryRepository)
        {
            _inventoryRepository = inventoryRepository;
        }

        public async Task<List<DispenseBatchOptionViewModel>> Handle(GetDispenseBatchesQuery request, CancellationToken ct)
        {
            List<MedicineInventory> batches = await _inventoryRepository
                .GetAllNoTracking(b => b.MedicineId == request.MedicineId, includeProperties: "WarehouseZone")
                .OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue)
                .ToListAsync(ct);

            return batches.Where(DispensingStock.IsUsable).Select(DispensingStock.ToBatchOption).ToList();
        }
    }
}
