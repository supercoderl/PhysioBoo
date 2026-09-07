
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.ReserveBatch
{
    public sealed class ReserveBatchCommandValidation : AbstractValidator<ReserveBatchCommand>
    {
        public ReserveBatchCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyId)
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.ReserveBatch.Quantity)
                .GreaterThan(0)
                .WithMessage("Quantity must be greater than zero.");
        }
    }
}
