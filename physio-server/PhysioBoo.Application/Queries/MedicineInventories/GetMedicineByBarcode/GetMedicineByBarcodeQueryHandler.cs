using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetMedicineByBarcode
{
    public sealed class GetMedicineByBarcodeQueryHandler : IRequestHandler<GetMedicineByBarcodeQuery, MedicineStockViewModel?>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public GetMedicineByBarcodeQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository inventoryRepository
        )
        {
            _medicineRepository = medicineRepository;
            _inventoryRepository = inventoryRepository;
        }

        public async Task<MedicineStockViewModel?> Handle(GetMedicineByBarcodeQuery request, CancellationToken ct)
        {
            string code = request.Code.Trim();
            if (code.Length == 0) return null;

            Medicine? medicine = await _medicineRepository
                .GetAllNoTracking(m => m.IsActive && (m.Barcode == code || m.QrCode == code || m.DrugCode == code), includeProperties: "Category")
                .FirstOrDefaultAsync(ct);

            if (medicine == null)
            {
                Guid? medicineId = await _inventoryRepository
                    .GetAllNoTracking(b => b.BatchNumber == code)
                    .Select(b => (Guid?)b.MedicineId)
                    .FirstOrDefaultAsync(ct);

                if (medicineId == null) return null;

                medicine = await _medicineRepository
                    .GetAllNoTracking(m => m.Id == medicineId.Value, includeProperties: "Category")
                    .FirstOrDefaultAsync(ct);

                if (medicine == null) return null;
            }

            List<MedicineInventory> batches = await _inventoryRepository
                .GetAllNoTracking(b => b.MedicineId == medicine.Id && b.Status != BatchLifecycleStatus.Disposed)
                .ToListAsync(ct);

            return MedicineStockViewModel.FromMedicine(medicine, batches);
        }
    }
}
