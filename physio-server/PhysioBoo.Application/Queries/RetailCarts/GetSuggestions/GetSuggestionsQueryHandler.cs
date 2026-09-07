
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.RetailCarts.SearchCatalog;
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.GetSuggestions
{
    // "Favorites" has no Retail-specific favorites concept (FavoriteMedication is doctor-prescribing
    // scoped, from the Prescriptions module) — falls back to Recommended until a cashier-facing
    // favorites list exists. "Recommended" is simply best-selling-by-volume for now, not a real
    // recommendation engine.
    public sealed class GetSuggestionsQueryHandler : IRequestHandler<GetSuggestionsQuery, List<RetailMedicineCardViewModel>>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;

        public GetSuggestionsQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task<List<RetailMedicineCardViewModel>> Handle(GetSuggestionsQuery request, CancellationToken ct)
        {
            DateTime since = DateTime.UtcNow.AddDays(-30);

            List<Guid> medicineIds;

            if (string.Equals(request.Mode, "RecentlySold", StringComparison.OrdinalIgnoreCase))
            {
                medicineIds = await _stockMovementRepository
                    .GetAllNoTracking(filter: sm => sm.Type == StockMovementType.RetailSale && sm.OccurredAt >= since)
                    .OrderByDescending(sm => sm.OccurredAt)
                    .Select(sm => sm.MedicineId)
                    .Distinct()
                    .Take(10)
                    .ToListAsync(ct);
            }
            else
            {
                medicineIds = await _stockMovementRepository
                    .GetAllNoTracking(filter: sm => sm.Type == StockMovementType.RetailSale && sm.OccurredAt >= since)
                    .GroupBy(sm => sm.MedicineId)
                    .OrderByDescending(g => g.Sum(sm => sm.Quantity))
                    .Select(g => g.Key)
                    .Take(10)
                    .ToListAsync(ct);
            }

            if (medicineIds.Count == 0) return new List<RetailMedicineCardViewModel>();

            List<Medicine> medicines = await _medicineRepository
                .GetAllNoTracking(filter: m => medicineIds.Contains(m.Id) && m.IsActive, includeProperties: "Category,Manufacturer")
                .ToListAsync(ct);

            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => medicineIds.Contains(b.MedicineId) && b.Status == BatchLifecycleStatus.Active)
                .ToListAsync(ct);

            return medicineIds
                .Select(id => medicines.FirstOrDefault(m => m.Id == id))
                .Where(m => m != null)
                .Select(m => SearchCatalogQueryHandler.MapToCard(m!, batches.Where(b => b.MedicineId == m!.Id).ToList()))
                .ToList();
        }
    }
}
