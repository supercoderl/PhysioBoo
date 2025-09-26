namespace PhysioBoo.Application.ViewModels.MedicineInventories
{
    public sealed record CreateMedicineInventoryViewModel
    (
        Guid Id,
        Guid MedicineId,
        Guid HospitalId,
        string? BatchNumber,
        Guid SupplierId,
        DateOnly? PurchaseDate,
        DateOnly? ExpiryDate,
        decimal? UnitPurchasePrice,
        decimal? UnitSellingPrice,
        decimal? TotalPurchaseValue,
        string? StorageLocation
    );
}
