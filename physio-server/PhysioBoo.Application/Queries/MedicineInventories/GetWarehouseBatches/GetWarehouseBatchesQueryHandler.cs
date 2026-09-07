
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetWarehouseBatches
{
    public sealed class GetWarehouseBatchesQueryHandler : IRequestHandler<GetWarehouseBatchesQuery, List<WarehouseBatchViewModel>>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public GetWarehouseBatchesQueryHandler(IMedicineInventoryRepository medicineInventoryRepository)
        {
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<List<WarehouseBatchViewModel>> Handle(GetWarehouseBatchesQuery request, CancellationToken ct)
        {
            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.MedicineId == request.MedicineId, includeProperties: "Supplier")
                .OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue)
                .ToListAsync(ct);

            return batches.Select(b => new WarehouseBatchViewModel
            {
                Id = b.Id,
                BatchNo = b.BatchNumber,
                MedicineId = b.MedicineId,
                ExpiryDate = b.ExpiryDate,
                ManufacturingDate = b.PurchaseDate,
                Quantity = b.QuantityAvailable,
                ReservedQuantity = b.ReservedQuantity,
                AvailableQuantity = b.QuantityAvailable - b.ReservedQuantity,
                Supplier = b.Supplier?.SupplierName,
                PurchasePrice = b.UnitPurchasePrice,
                StorageLocation = b.StorageLocation,
                Status = b.Status,
                IsNearExpiry = b.IsNearExpiry,
                IsExpired = b.IsExpired
            }).ToList();
        }
    }
}
