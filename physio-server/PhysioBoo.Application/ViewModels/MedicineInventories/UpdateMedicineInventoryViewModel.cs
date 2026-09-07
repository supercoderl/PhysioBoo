namespace PhysioBoo.Application.ViewModels.MedicineInventories
{
    public sealed record UpdateMedicineInventoryViewModel
    (
        decimal? UnitSellingPrice,
        string? StorageLocation,
        int MinimumStockLevel,
        int MaximumStockLevel
    );
}
