using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class WarehouseBatchViewModel
    {
        public Guid Id { get; set; }
        public string? BatchNo { get; set; }
        public Guid MedicineId { get; set; }
        public DateOnly? ExpiryDate { get; set; }
        // MedicineInventory has no ManufacturingDate field today — PurchaseDate is used as the
        // closest available approximation until that field is added to the entity.
        public DateOnly? ManufacturingDate { get; set; }
        public int Quantity { get; set; }
        public int ReservedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public string? Supplier { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? StorageLocation { get; set; }
        public BatchLifecycleStatus Status { get; set; }
        public bool IsNearExpiry { get; set; }
        public bool IsExpired { get; set; }

        /// <summary>
        /// Expects Supplier to be loaded for the supplier name.
        /// </summary>
        public static WarehouseBatchViewModel FromEntity(MedicineInventory b)
        {
            return new WarehouseBatchViewModel
            {
                Id = b.Id,
                BatchNo = b.BatchNumber,
                MedicineId = b.MedicineId,
                ExpiryDate = b.ExpiryDate,
                ManufacturingDate = b.PurchaseDate,
                Quantity = b.QuantityAvailable,
                ReservedQuantity = b.ReservedQuantity,
                AvailableQuantity = b.QuantityAvailable - b.ReservedQuantity,
                Supplier = b.Supplier?.SupplierName,
                PurchasePrice = b.UnitPurchasePrice,
                StorageLocation = b.StorageLocation,
                Status = b.Status,
                IsNearExpiry = b.IsNearExpiry,
                IsExpired = b.IsExpired
            };
        }
    }
}
