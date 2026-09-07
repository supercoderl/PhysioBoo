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
    }
}
