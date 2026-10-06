using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dispensing.ReserveDispenseItem
{
    public sealed class ReserveDispenseItemCommandValidation : AbstractValidator<ReserveDispenseItemCommand>
    {
        public ReserveDispenseItemCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Prescription id may not be empty.");
            RuleFor(c => c.ItemId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Item id may not be empty.");
        }
    }
}
