
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetMedicineStockDetail
{
    public sealed class GetMedicineStockDetailQueryHandler : IRequestHandler<GetMedicineStockDetailQuery, MedicineStockDetailViewModel?>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public GetMedicineStockDetailQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<MedicineStockDetailViewModel?> Handle(GetMedicineStockDetailQuery request, CancellationToken ct)
        {
            Medicine? medicine = await _medicineRepository.GetByIdAsync(request.MedicineId, includeProperties: "Category,Manufacturer", ct: ct);

            if (medicine == null) return null;

            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.MedicineId == request.MedicineId && b.Status != BatchLifecycleStatus.Disposed)
                .ToListAsync(ct);

            int currentStock = batches.Sum(b => b.QuantityAvailable);
            int safetyStock = batches.Sum(b => b.MinimumStockLevel);
            int reorderLevel = batches.Sum(b => b.ReorderLevel);

            string status = currentStock <= 0 ? "OutOfStock"
                : currentStock <= reorderLevel ? "LowStock"
                : "InStock";

            decimal totalValue = batches.Sum(b => b.QuantityAvailable * (b.UnitPurchasePrice ?? 0));
            decimal averageUnitCost = currentStock > 0 ? totalValue / currentStock : 0;

            return new MedicineStockDetailViewModel
            {
                Id = medicine.Id,
                Name = medicine.Name,
                GenericName = medicine.GenericName,
                Manufacturer = medicine.Manufacturer?.Name,
                Category = medicine.Category?.Name,
                CurrentStock = currentStock,
                SafetyStock = safetyStock,
                ReorderLevel = reorderLevel,
                Status = status,
                Unit = medicine.DosageForm.ToString(),
                AverageUnitCost = averageUnitCost,
                TotalValue = totalValue,
                StorageLocations = batches
                    .Where(b => !string.IsNullOrWhiteSpace(b.StorageLocation))
                    .Select(b => b.StorageLocation!)
                    .Distinct()
                    .ToList()
            };
        }
    }
}
