using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class MedicineStockViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public int CurrentStock { get; set; }
        public int SafetyStock { get; set; }
        public int ReorderLevel { get; set; }
        public string Status { get; set; } = "InStock"; // InStock | LowStock | OutOfStock
        public int BatchCount { get; set; }
        public DateOnly? SoonestExpiryDate { get; set; }
        public bool IsNearExpiry { get; set; }
        public string? StorageLocation { get; set; }
        public string? Category { get; set; }
        public string? Barcode { get; set; }

        /// <summary>
        /// Aggregates a medicine's (non-disposed) batches into a stock card. Expects Category to be loaded.
        /// </summary>
        public static MedicineStockViewModel FromMedicine(Medicine m, IEnumerable<MedicineInventory> batches)
        {
            List<MedicineInventory> medicineBatches = batches.Where(b => b.MedicineId == m.Id).ToList();
            int currentStock = medicineBatches.Sum(b => b.QuantityAvailable);
            // No per-medicine safety/reorder field exists — approximated as the sum across
            // this medicine's batches, since those levels are set per batch today.
            int safetyStock = medicineBatches.Sum(b => b.MinimumStockLevel);
            int reorderLevel = medicineBatches.Sum(b => b.ReorderLevel);

            string status = currentStock <= 0 ? "OutOfStock"
                : currentStock <= reorderLevel ? "LowStock"
                : "InStock";

            return new MedicineStockViewModel
            {
                Id = m.Id,
                Name = m.Name,
                GenericName = m.GenericName,
                CurrentStock = currentStock,
                SafetyStock = safetyStock,
                ReorderLevel = reorderLevel,
                Status = status,
                BatchCount = medicineBatches.Count,
                SoonestExpiryDate = medicineBatches.Where(b => b.ExpiryDate.HasValue).OrderBy(b => b.ExpiryDate).Select(b => b.ExpiryDate).FirstOrDefault(),
                IsNearExpiry = medicineBatches.Any(b => b.IsNearExpiry),
                StorageLocation = medicineBatches.FirstOrDefault()?.StorageLocation,
                Category = m.Category?.Name,
                Barcode = m.Barcode
            };
        }
    }
}
