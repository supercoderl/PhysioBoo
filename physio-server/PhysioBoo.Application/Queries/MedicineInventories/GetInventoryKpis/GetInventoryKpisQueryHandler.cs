
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetInventoryKpis
{
    public sealed class GetInventoryKpisQueryHandler : IRequestHandler<GetInventoryKpisQuery, InventoryKpisViewModel>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;

        public GetInventoryKpisQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task<InventoryKpisViewModel> Handle(GetInventoryKpisQuery request, CancellationToken ct)
        {
            int totalMedicines = await _medicineRepository.GetAllNoTracking(filter: m => m.IsActive).CountAsync(ct);

            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.Status != BatchLifecycleStatus.Disposed)
                .ToListAsync(ct);

            // Low/out-of-stock are evaluated batch-by-batch, not aggregated per medicine — a medicine
            // with several small batches may show as low stock here even if its combined quantity is
            // healthy. Good enough for a first pass; revisit if per-medicine aggregation is needed.
            int lowStockCount = batches.Count(b => b.QuantityAvailable > 0 && b.QuantityAvailable <= b.ReorderLevel);
            int outOfStockCount = batches.Count(b => b.QuantityAvailable <= 0);

            DateTime todayStart = TimeZoneHelper.GetLocalTimeNow().Date;
            int todayMovementsCount = await _stockMovementRepository
                .GetAllNoTracking(filter: m => m.OccurredAt >= todayStart)
                .CountAsync(ct);

            return new InventoryKpisViewModel
            {
                TotalInventoryValue = batches.Sum(b => b.QuantityAvailable * (b.UnitPurchasePrice ?? 0)),
                TotalMedicines = totalMedicines,
                AvailableStock = batches.Sum(b => b.QuantityAvailable),
                ReservedStock = batches.Sum(b => b.ReservedQuantity),
                LowStockCount = lowStockCount,
                OutOfStockCount = outOfStockCount,
                NearExpiryCount = batches.Count(b => b.IsNearExpiry),
                ExpiredCount = batches.Count(b => b.IsExpired),
                TodayMovementsCount = todayMovementsCount,
                PendingPurchaseOrders = 0
            };
        }
    }
}
