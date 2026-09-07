
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.LockBatch
{
    public sealed class LockBatchCommandValidation : AbstractValidator<LockBatchCommand>
    {
        public LockBatchCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyId)
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.LockBatch.Reason)
                .NotEmpty()
                .WithMessage("Reason may not be empty.");
        }
    }
}
