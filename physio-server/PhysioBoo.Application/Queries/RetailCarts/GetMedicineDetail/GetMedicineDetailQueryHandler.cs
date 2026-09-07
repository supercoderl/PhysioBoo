
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.RetailCarts.SearchCatalog;
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.GetMedicineDetail
{
    public sealed class GetMedicineDetailQueryHandler : IRequestHandler<GetMedicineDetailQuery, RetailMedicineDetailViewModel?>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;

        public GetMedicineDetailQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task<RetailMedicineDetailViewModel?> Handle(GetMedicineDetailQuery request, CancellationToken ct)
        {
            Medicine? medicine = await _medicineRepository.GetByIdAsync(request.MedicineId, includeProperties: "Category,Manufacturer", ct: ct);

            if (medicine == null) return null;

            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.MedicineId == request.MedicineId && b.Status == BatchLifecycleStatus.Active)
                .ToListAsync(ct);

            RetailMedicineCardViewModel card = SearchCatalogQueryHandler.MapToCard(medicine, batches);

            // Same-category medicines with stock, as a simple alternative suggestion — not a real
            // therapeutic-equivalence engine.
            List<Medicine> alternativeMedicines = await _medicineRepository
                .GetAllNoTracking(filter: m => m.CategoryId == medicine.CategoryId && m.Id != medicine.Id && m.IsActive)
                .Take(5)
                .ToListAsync(ct);

            List<Guid> altIds = alternativeMedicines.Select(m => m.Id).ToList();
            List<MedicineInventory> altBatches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => altIds.Contains(b.MedicineId) && b.Status == BatchLifecycleStatus.Active)
                .ToListAsync(ct);

            List<StockMovement> recentMovements = await _stockMovementRepository
                .GetAllNoTracking(filter: sm => sm.MedicineId == request.MedicineId)
                .OrderByDescending(sm => sm.OccurredAt)
                .Take(20)
                .ToListAsync(ct);

            return new RetailMedicineDetailViewModel
            {
                Id = card.Id,
                Name = card.Name,
                GenericName = card.GenericName,
                Strength = card.Strength,
                PackageLabel = card.PackageLabel,
                Category = card.Category,
                Manufacturer = card.Manufacturer,
                BatchNo = card.BatchNo,
                ExpiryDate = card.ExpiryDate,
                Barcode = card.Barcode,
                Stock = card.Stock,
                Price = card.Price,
                Mrp = card.Mrp,
                InsuranceCovered = card.InsuranceCovered,
                Alternatives = alternativeMedicines.Select(m => new RetailMedicineAlternativeViewModel
                {
                    Id = m.Id,
                    Name = m.Name,
                    Manufacturer = m.Manufacturer?.Name,
                    Price = altBatches.Where(b => b.MedicineId == m.Id).OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue).FirstOrDefault()?.UnitSellingPrice ?? m.SellingPrice ?? 0,
                    Stock = altBatches.Where(b => b.MedicineId == m.Id).Sum(b => b.QuantityAvailable)
                }).ToList(),
                InteractionWarnings = new List<string>(), // no drug-interaction engine wired to Retail yet
                InventoryMovements = recentMovements.Select(sm => new RetailInventoryMovementViewModel
                {
                    Date = sm.OccurredAt,
                    Type = sm.Type is StockMovementType.Receiving or StockMovementType.Purchase or StockMovementType.Return ? "In" : "Out",
                    Quantity = sm.Quantity,
                    Reference = sm.Reference
                }).ToList()
            };
        }
    }
}
