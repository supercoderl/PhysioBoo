
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetCategories
{
    public sealed class GetStockTakeCategoriesQueryHandler : IRequestHandler<GetStockTakeCategoriesQuery, List<StockTakeCategoryNodeViewModel>>
    {
        private readonly IStockTakeItemRepository _stockTakeItemRepository;

        public GetStockTakeCategoriesQueryHandler(IStockTakeItemRepository stockTakeItemRepository)
        {
            _stockTakeItemRepository = stockTakeItemRepository;
        }

        public async Task<List<StockTakeCategoryNodeViewModel>> Handle(GetStockTakeCategoriesQuery request, CancellationToken ct)
        {
            List<StockTakeItem> items = await _stockTakeItemRepository
                .GetAllNoTracking(filter: i => i.StockTakeId == request.StockTakeId, includeProperties: "MedicineInventory.Medicine.Category")
                .ToListAsync(ct);

            return items
                .Where(i => i.MedicineInventory?.Medicine?.Category != null)
                .GroupBy(i => i.MedicineInventory!.Medicine!.Category!)
                .Select(g => new StockTakeCategoryNodeViewModel
                {
                    Id = g.Key.Id,
                    Name = g.Key.Name,
                    Type = "Medicine",
                    ItemCount = g.Count(),
                    CountedCount = g.Count(i => i.IsCounted)
                })
                .OrderBy(c => c.Name)
                .ToList();
        }
    }
}
