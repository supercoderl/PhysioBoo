
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.RetailCarts.SearchCatalog;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.LookupByBarcode
{
    public sealed class LookupByBarcodeQueryHandler : IRequestHandler<LookupByBarcodeQuery, ViewModels.Retail.RetailMedicineCardViewModel?>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public LookupByBarcodeQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<ViewModels.Retail.RetailMedicineCardViewModel?> Handle(LookupByBarcodeQuery request, CancellationToken ct)
        {
            Medicine? medicine = await _medicineRepository
                .GetAllNoTracking(filter: m => m.Barcode == request.Code, includeProperties: "Category,Manufacturer")
                .FirstOrDefaultAsync(ct);

            if (medicine == null) return null;

            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.MedicineId == medicine.Id && b.Status == BatchLifecycleStatus.Active)
                .ToListAsync(ct);

            return SearchCatalogQueryHandler.MapToCard(medicine, batches);
        }
    }
}
