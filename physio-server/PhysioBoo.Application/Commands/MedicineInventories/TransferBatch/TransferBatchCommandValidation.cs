
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.TransferBatch
{
    public sealed class TransferBatchCommandValidation : AbstractValidator<TransferBatchCommand>
    {
        public TransferBatchCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyId)
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.TransferBatch.NewWarehouseZoneId)
                .NotEmpty()
                .WithMessage("NewWarehouseZoneId may not be empty.");
        }
    }
}
