namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class MedicineStockFilter
    {
        public string? Status { get; set; } // InStock | LowStock | OutOfStock
        public Guid? CategoryId { get; set; }
    }
}
