
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetItems
{
    public sealed class GetStockTakeItemsQueryHandler : IRequestHandler<GetStockTakeItemsQuery, List<StockTakeItemViewModel>>
    {
        private readonly IStockTakeItemRepository _stockTakeItemRepository;

        public GetStockTakeItemsQueryHandler(IStockTakeItemRepository stockTakeItemRepository)
        {
            _stockTakeItemRepository = stockTakeItemRepository;
        }

        public async Task<List<StockTakeItemViewModel>> Handle(GetStockTakeItemsQuery request, CancellationToken ct)
        {
            List<StockTakeItem> items = await _stockTakeItemRepository
                .GetAllNoTracking(
                    filter: i => i.StockTakeId == request.StockTakeId,
                    includeProperties: "MedicineInventory.Medicine"
                )
                .ToListAsync(ct);

            IEnumerable<StockTakeItem> filtered = items;

            if (request.CategoryId != null)
                filtered = filtered.Where(i => i.MedicineInventory?.Medicine?.CategoryId == request.CategoryId.Value);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim().ToLower();
                filtered = filtered.Where(i => (i.MedicineInventory?.Medicine?.Name.ToLower().Contains(term) ?? false)
                    || (i.MedicineInventory?.BatchNumber?.ToLower().Contains(term) ?? false));
            }

            return filtered.Select(i => StockTakeItemViewModel.FromStockTakeItem(i)).ToList();
        }
    }
}
