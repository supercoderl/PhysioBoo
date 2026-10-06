using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.ChangeBatch
{
    public sealed class ChangeBatchCommandValidation : AbstractValidator<ChangeBatchCommand>
    {
        public ChangeBatchCommandValidation()
        {
            RuleFor(c => c.BatchId).NotEmpty().WithErrorCode(DomainErrorCodes.InventoryBatch.EmptyId).WithMessage("Batch id may not be empty.");

            RuleFor(c => c.Quantity)
                .NotNull().GreaterThan(0).WithErrorCode(DomainErrorCodes.InventoryBatch.InvalidQuantity).WithMessage("Quantity must be greater than 0.")
                .When(c => c.Action is InventoryBatchAction.Receive or InventoryBatchAction.Transfer or InventoryBatchAction.Reserve or InventoryBatchAction.Dispose);

            RuleFor(c => c.Quantity)
                .NotNull().GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.InventoryBatch.InvalidQuantity).WithMessage("New quantity may not be negative.")
                .When(c => c.Action == InventoryBatchAction.Adjust);

            RuleFor(c => c.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InventoryBatch.EmptyReason).WithMessage("A reason is required.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.InventoryBatch.EmptyReason).WithMessage("Reason may not exceed 500 characters.")
                .When(c => c.Action is InventoryBatchAction.Adjust or InventoryBatchAction.Lock or InventoryBatchAction.Dispose);

            RuleFor(c => c.ToZoneId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InventoryBatch.InvalidZone).WithMessage("Destination zone is required.")
                .When(c => c.Action == InventoryBatchAction.Transfer);

            RuleFor(c => c.PurchasePrice)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.InventoryBatch.InvalidQuantity).WithMessage("Purchase price may not be negative.")
                .When(c => c.PurchasePrice.HasValue);
        }
    }
}
