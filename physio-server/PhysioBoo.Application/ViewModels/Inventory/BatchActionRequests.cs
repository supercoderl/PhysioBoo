namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed record ReceiveBatchViewModel(int Quantity, decimal? PurchasePrice, Guid? SupplierId, DateOnly? ManufacturingDate, DateOnly? ExpiryDate);

    public sealed record TransferInventoryBatchViewModel(Guid ToZoneId, int Quantity);

    public sealed record AdjustBatchViewModel(int NewQuantity, string Reason);

    public sealed record ReserveInventoryBatchViewModel(int Quantity, string? Reference);

    public sealed record LockInventoryBatchViewModel(string Reason);

    public sealed record DisposeInventoryBatchViewModel(string Reason, int Quantity);
}
