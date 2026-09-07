
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetSummary
{
    public sealed class GetStockTakeSummaryQueryHandler : IRequestHandler<GetStockTakeSummaryQuery, StockTakeSummaryViewModel>
    {
        private readonly IStockTakeItemRepository _stockTakeItemRepository;

        public GetStockTakeSummaryQueryHandler(IStockTakeItemRepository stockTakeItemRepository)
        {
            _stockTakeItemRepository = stockTakeItemRepository;
        }

        public async Task<StockTakeSummaryViewModel> Handle(GetStockTakeSummaryQuery request, CancellationToken ct)
        {
            List<StockTakeItem> items = await _stockTakeItemRepository
                .GetAllNoTracking(filter: i => i.StockTakeId == request.StockTakeId, includeProperties: "MedicineInventory")
                .ToListAsync(ct);

            int totalItems = items.Count;
            int countedItems = items.Count(i => i.IsCounted);
            List<StockTakeItem> counted = items.Where(i => i.IsCounted).ToList();

            return new StockTakeSummaryViewModel
            {
                TotalItems = totalItems,
                CountedItems = countedItems,
                RemainingItems = totalItems - countedItems,
                PositiveDifferenceCount = counted.Count(i => i.Difference() > 0),
                NegativeDifferenceCount = counted.Count(i => i.Difference() < 0),
                ValueDifference = counted.Sum(i => i.Difference() * (i.MedicineInventory?.UnitPurchasePrice ?? 0)),
                CompletionPercent = totalItems == 0 ? 0 : Math.Round(100m * countedItems / totalItems, 1)
            };
        }
    }
}
