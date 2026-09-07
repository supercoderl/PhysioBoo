namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class MedicineStockDetailViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string? Manufacturer { get; set; }
        public string? Category { get; set; }
        public int CurrentStock { get; set; }
        public int SafetyStock { get; set; }
        public int ReorderLevel { get; set; }
        public string Status { get; set; } = "InStock";
        public string? Unit { get; set; }
        public decimal AverageUnitCost { get; set; }
        public decimal TotalValue { get; set; }
        public List<string> StorageLocations { get; set; } = new();
    }
}
