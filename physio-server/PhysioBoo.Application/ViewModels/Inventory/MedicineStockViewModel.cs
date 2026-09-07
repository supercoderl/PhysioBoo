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
    }
}
