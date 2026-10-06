namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed record ReceiveBatchViewModel(int Quantity, decimal? PurchasePrice, Guid? SupplierId, DateOnly? ManufacturingDate, DateOnly? ExpiryDate);

    public sealed record TransferBatchViewModel(Guid ToZoneId, int Quantity);

    public sealed record AdjustBatchViewModel(int NewQuantity, string Reason);

    public sealed record ReserveBatchViewModel(int Quantity, string? Reference);

    public sealed record LockBatchViewModel(string Reason);

    public sealed record DisposeBatchViewModel(string Reason, int Quantity);
}
