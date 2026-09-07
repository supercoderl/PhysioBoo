namespace PhysioBoo.Application.ViewModels.StockTakes
{
    // Thin projection over Hospital — WarehouseId maps directly to HospitalId (one hospital = one
    // warehouse), per the decision recorded in docs/stock-take-redesign.md §17.0.
    public sealed class WarehouseLookupViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
