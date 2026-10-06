using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dispensing.ReplaceDispenseItem
{
    public sealed class ReplaceDispenseItemCommandValidation : AbstractValidator<ReplaceDispenseItemCommand>
    {
        public ReplaceDispenseItemCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Prescription id may not be empty.");
            RuleFor(c => c.ItemId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Item id may not be empty.");
            RuleFor(c => c.AlternativeMedicineId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.InvalidAlternative).WithMessage("Alternative medicine is required.");
            RuleFor(c => c.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyReason).WithMessage("A substitution reason is required.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Dispensing.EmptyReason).WithMessage("Reason may not exceed 500 characters.");
        }
    }
}
