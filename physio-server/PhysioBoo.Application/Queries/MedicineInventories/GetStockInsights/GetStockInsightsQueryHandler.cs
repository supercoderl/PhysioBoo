
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetStockInsights
{
    // Deliberately simple for a first pass: three derived counts, not a real analytics/forecast
    // engine. Extend with trend/velocity insights once StockMovement has enough history to mine.
    public sealed class GetStockInsightsQueryHandler : IRequestHandler<GetStockInsightsQuery, List<StockInsightViewModel>>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public GetStockInsightsQueryHandler(IMedicineInventoryRepository medicineInventoryRepository)
        {
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<List<StockInsightViewModel>> Handle(GetStockInsightsQuery request, CancellationToken ct)
        {
            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b =>
                    b.Status != BatchLifecycleStatus.Disposed
                    && (request.MedicineId == null || b.MedicineId == request.MedicineId))
                .ToListAsync(ct);

            List<StockInsightViewModel> insights = new List<StockInsightViewModel>();

            int lowStockCount = batches.Count(b => b.QuantityAvailable > 0 && b.QuantityAvailable <= b.ReorderLevel);
            int outOfStockCount = batches.Count(b => b.QuantityAvailable <= 0);
            int nearExpiryCount = batches.Count(b => b.IsNearExpiry);

            if (outOfStockCount > 0)
            {
                insights.Add(new StockInsightViewModel
                {
                    Id = "out-of-stock",
                    Message = $"{outOfStockCount} batch(es) out of stock",
                    Tone = "danger"
                });
            }

            if (lowStockCount > 0)
            {
                insights.Add(new StockInsightViewModel
                {
                    Id = "low-stock",
                    Message = $"{lowStockCount} batch(es) at or below reorder level",
                    Tone = "warning"
                });
            }

            if (nearExpiryCount > 0)
            {
                insights.Add(new StockInsightViewModel
                {
                    Id = "near-expiry",
                    Message = $"{nearExpiryCount} batch(es) nearing expiry",
                    Tone = "warning"
                });
            }

            if (insights.Count == 0)
            {
                insights.Add(new StockInsightViewModel
                {
                    Id = "healthy",
                    Message = "Stock levels look healthy",
                    Tone = "success"
                });
            }

            return insights;
        }
    }
}
