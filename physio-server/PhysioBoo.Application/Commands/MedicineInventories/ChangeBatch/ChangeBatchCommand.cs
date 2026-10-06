namespace PhysioBoo.Application.Commands.MedicineInventories.ChangeBatch
{
    /// <summary>
    /// Warehouse operations on a single batch (receive, transfer, adjust, reserve, lock, dispose).
    /// </summary>
    public sealed class ChangeBatchCommand : CommandBase, IRequest
    {
        private static readonly ChangeBatchCommandValidation s_validation = new();

        public Guid BatchId { get; }
        public InventoryBatchAction Action { get; }
        public int? Quantity { get; init; }
        public string? Reason { get; init; }
        public Guid? ToZoneId { get; init; }
        public decimal? PurchasePrice { get; init; }
        public Guid? SupplierId { get; init; }
        public DateOnly? ExpiryDate { get; init; }

        public ChangeBatchCommand(Guid batchId, InventoryBatchAction action) : base(batchId)
        {
            BatchId = batchId;
            Action = action;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
