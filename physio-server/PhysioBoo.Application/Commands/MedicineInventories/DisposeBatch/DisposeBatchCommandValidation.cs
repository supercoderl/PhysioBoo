
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.DisposeBatch
{
    public sealed class DisposeBatchCommandValidation : AbstractValidator<DisposeBatchCommand>
    {
        public DisposeBatchCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyId)
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.DisposeBatch.Reason)
                .NotEmpty()
                .WithMessage("Reason may not be empty.");
        }
    }
}
