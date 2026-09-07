
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.GetInsight
{
    public sealed class GetInsightQueryHandler : IRequestHandler<GetInsightQuery, RetailInventoryInsightViewModel>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IRetailTransactionRepository _retailTransactionRepository;
        private readonly IStockMovementRepository _stockMovementRepository;

        public GetInsightQueryHandler(
            IMedicineInventoryRepository medicineInventoryRepository,
            IMedicineRepository medicineRepository,
            IRetailTransactionRepository retailTransactionRepository,
            IStockMovementRepository stockMovementRepository
        )
        {
            _medicineInventoryRepository = medicineInventoryRepository;
            _medicineRepository = medicineRepository;
            _retailTransactionRepository = retailTransactionRepository;
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task<RetailInventoryInsightViewModel> Handle(GetInsightQuery request, CancellationToken ct)
        {
            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.Status != BatchLifecycleStatus.Disposed)
                .ToListAsync(ct);

            DateTime todayStart = DateTime.UtcNow.Date;

            List<RetailTransaction> todayTransactions = await _retailTransactionRepository
                .GetAllNoTracking(filter: t => t.CompletedAt >= todayStart && t.Status == RetailTransactionStatus.Completed)
                .ToListAsync(ct);

            (Guid MedicineId, int Quantity)? bestSeller = (await _stockMovementRepository
                .GetAllNoTracking(filter: sm => sm.Type == StockMovementType.RetailSale && sm.OccurredAt >= todayStart)
                .GroupBy(sm => sm.MedicineId)
                .Select(g => new { MedicineId = g.Key, Quantity = g.Sum(sm => sm.Quantity) })
                .OrderByDescending(g => g.Quantity)
                .Select(g => new ValueTuple<Guid, int>(g.MedicineId, g.Quantity))
                .FirstOrDefaultAsync(ct));

            string? bestSellerName = null;
            if (bestSeller != null && bestSeller.Value.MedicineId != Guid.Empty)
            {
                Medicine? medicine = await _medicineRepository.GetByIdAsync(bestSeller.Value.MedicineId, ct: ct);
                bestSellerName = medicine?.Name;
            }

            return new RetailInventoryInsightViewModel
            {
                LowStockCount = batches.Count(b => b.QuantityAvailable > 0 && b.QuantityAvailable <= b.ReorderLevel),
                NearExpiryCount = batches.Count(b => b.IsNearExpiry),
                OutOfStockCount = batches.Count(b => b.QuantityAvailable <= 0),
                BestSellerName = bestSellerName,
                BestSellerUnitsSold = bestSellerName == null ? null : bestSeller!.Value.Quantity,
                TodayRevenue = todayTransactions.Sum(t => t.GrandTotal),
                TodaySalesCount = todayTransactions.Count
            };
        }
    }
}
