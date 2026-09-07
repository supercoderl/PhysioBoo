namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class InventoryHistoryEntryViewModel
    {
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Reference { get; set; }
        public string Actor { get; set; } = string.Empty;
    }
}
