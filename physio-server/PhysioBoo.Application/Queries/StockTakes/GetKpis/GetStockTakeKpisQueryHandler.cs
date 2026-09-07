
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetKpis
{
    public sealed class GetStockTakeKpisQueryHandler : IRequestHandler<GetStockTakeKpisQuery, StockTakeKpisViewModel>
    {
        private readonly IStockTakeRepository _stockTakeRepository;

        public GetStockTakeKpisQueryHandler(IStockTakeRepository stockTakeRepository)
        {
            _stockTakeRepository = stockTakeRepository;
        }

        public async Task<StockTakeKpisViewModel> Handle(GetStockTakeKpisQuery request, CancellationToken ct)
        {
            List<StockTake> all = await _stockTakeRepository
                .GetAllNoTracking(includeProperties: "StockTakeItems.MedicineInventory")
                .ToListAsync(ct);

            DateTime monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

            List<StockTake> approvedThisMonth = all.Where(s => s.Status == StockTakeStatus.Approved && s.UpdatedAt >= monthStart).ToList();

            return new StockTakeKpisViewModel
            {
                ActiveSessions = all.Count(s => s.Status == StockTakeStatus.Counting || s.Status == StockTakeStatus.Draft),
                PendingApproval = all.Count(s => s.Status == StockTakeStatus.PendingApproval),
                CompletedThisMonth = approvedThisMonth.Count,
                TotalDifferenceValue = approvedThisMonth.Sum(s => s.StockTakeItems
                    .Where(i => i.IsCounted)
                    .Sum(i => i.Difference() * (i.MedicineInventory?.UnitPurchasePrice ?? 0))),
                DiscrepancySessions = approvedThisMonth.Count(s => s.StockTakeItems.Any(i => i.IsCounted && i.Difference() != 0))
            };
        }
    }
}
