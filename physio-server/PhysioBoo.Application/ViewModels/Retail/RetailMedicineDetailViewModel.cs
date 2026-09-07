namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed class RetailMedicineAlternativeViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Manufacturer { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }

    public sealed class RetailInventoryMovementViewModel
    {
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty; // In | Out
        public int Quantity { get; set; }
        public string? Reference { get; set; }
    }

    public sealed class RetailMedicineDetailViewModel : RetailMedicineCardViewModel
    {
        public List<RetailMedicineAlternativeViewModel> Alternatives { get; set; } = new();
        public List<string> InteractionWarnings { get; set; } = new();
        public List<RetailInventoryMovementViewModel> InventoryMovements { get; set; } = new();
    }
}
