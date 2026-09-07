namespace PhysioBoo.Application.ViewModels.MedicineInventories
{
    public sealed record AdjustQuantityViewModel(
        int NewQuantity,
        string? Reason
    );
}
