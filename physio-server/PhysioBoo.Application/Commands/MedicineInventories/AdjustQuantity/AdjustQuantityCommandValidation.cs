
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.AdjustQuantity
{
    public sealed class AdjustQuantityCommandValidation : AbstractValidator<AdjustQuantityCommand>
    {
        public AdjustQuantityCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyId)
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.AdjustQuantity.NewQuantity)
                .GreaterThanOrEqualTo(0)
                .WithMessage("NewQuantity cannot be negative.");

            RuleFor(cmd => cmd.AdjustQuantity.Reason)
                .NotEmpty()
                .WithMessage("Reason may not be empty.");
        }
    }
}
