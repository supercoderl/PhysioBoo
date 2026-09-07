namespace PhysioBoo.Application.ViewModels.MedicineInventories
{
    public sealed record ReceiveStockViewModel(
        Guid BatchId,
        int Quantity
    );
}
