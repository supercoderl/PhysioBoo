using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Dispensing
{
    /// <summary>
    /// Batches, medicine master data and same-generic alternatives for a set of medicines,
    /// loaded in a few queries so the workspace can be built without N+1 lookups.
    /// </summary>
    public sealed class DispensingStock
    {
        public Dictionary<Guid, Medicine> Medicines { get; } = new();
        public Dictionary<Guid, List<MedicineInventory>> Batches { get; } = new();
        public Dictionary<Guid, List<DispenseMedicineAlternativeViewModel>> Alternatives { get; } = new();

        public List<MedicineInventory> BatchesOf(Guid medicineId) =>
            Batches.TryGetValue(medicineId, out List<MedicineInventory>? list) ? list : new List<MedicineInventory>();

        public static async Task<DispensingStock> LoadAsync(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository inventoryRepository,
            IEnumerable<Guid> medicineIds,
            CancellationToken ct
        )
        {
            DispensingStock stock = new DispensingStock();
            List<Guid> ids = medicineIds.Distinct().ToList();
            if (ids.Count == 0) return stock;

            List<Medicine> medicines = await medicineRepository
                .GetAllNoTracking(m => ids.Contains(m.Id), includeProperties: "Manufacturer")
                .ToListAsync(ct);

            List<string> generics = medicines
                .Where(m => !string.IsNullOrWhiteSpace(m.GenericName))
                .Select(m => m.GenericName!.ToLower())
                .Distinct()
                .ToList();

            List<Medicine> candidates = generics.Count == 0
                ? new List<Medicine>()
                : await medicineRepository
                    .GetAllNoTracking(m => m.IsActive && !m.IsBanned && m.GenericName != null && generics.Contains(m.GenericName.ToLower()) && !ids.Contains(m.Id),
                        includeProperties: "Manufacturer")
                    .ToListAsync(ct);

            List<Guid> allIds = ids.Concat(candidates.Select(c => c.Id)).ToList();
            List<MedicineInventory> batches = await inventoryRepository
                .GetAllNoTracking(b => allIds.Contains(b.MedicineId), includeProperties: "WarehouseZone")
                .OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue)
                .ToListAsync(ct);

            foreach (Medicine m in medicines.Concat(candidates)) stock.Medicines[m.Id] = m;
            foreach (IGrouping<Guid, MedicineInventory> g in batches.GroupBy(b => b.MedicineId)) stock.Batches[g.Key] = g.ToList();

            foreach (Medicine medicine in medicines)
            {
                stock.Alternatives[medicine.Id] = candidates
                    .Where(c => string.Equals(c.GenericName, medicine.GenericName, StringComparison.OrdinalIgnoreCase))
                    .Select(c => new DispenseMedicineAlternativeViewModel
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Manufacturer = c.Manufacturer?.Name ?? string.Empty,
                        Stock = stock.BatchesOf(c.Id).Where(IsUsable).Sum(FreeQuantity)
                    })
                    .Where(a => a.Stock > 0)
                    .OrderByDescending(a => a.Stock)
                    .ToList();
            }

            return stock;
        }

        public static int FreeQuantity(MedicineInventory batch) => Math.Max(0, batch.QuantityAvailable - batch.ReservedQuantity);

        public static bool IsExpired(MedicineInventory batch) =>
            batch.IsExpired || (batch.ExpiryDate.HasValue && batch.ExpiryDate.Value < DateOnly.FromDateTime(DateTime.Today));

        /// <summary>
        /// A batch can be picked from when it is not locked/disposed/expired and has unreserved stock.
        /// </summary>
        public static bool IsUsable(MedicineInventory batch) =>
            batch.Status is BatchLifecycleStatus.Active or BatchLifecycleStatus.Reserved
            && !IsExpired(batch)
            && FreeQuantity(batch) > 0;

        /// <summary>
        /// First-expiry-first-out: the earliest-expiring usable batch that covers the quantity,
        /// otherwise the earliest-expiring usable batch at all.
        /// </summary>
        public MedicineInventory? PickFefo(Guid medicineId, int quantity)
        {
            List<MedicineInventory> usable = BatchesOf(medicineId).Where(IsUsable).ToList();
            return usable.FirstOrDefault(b => FreeQuantity(b) >= quantity) ?? usable.FirstOrDefault();
        }

        public static string Location(MedicineInventory batch) =>
            batch.WarehouseZone?.Name ?? batch.StorageLocation ?? string.Empty;

        public static DispenseBatchOptionViewModel ToBatchOption(MedicineInventory batch) => new()
        {
            BatchNo = batch.BatchNumber ?? string.Empty,
            ExpiryDate = batch.ExpiryDate,
            QuantityAvailable = FreeQuantity(batch),
            Location = Location(batch),
            IsNearExpiry = batch.IsNearExpiry,
            IsExpired = IsExpired(batch)
        };
    }
}
