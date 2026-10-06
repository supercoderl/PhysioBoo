using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dispensing.CompleteDispensing
{
    public sealed class CompleteDispensingCommandValidation : AbstractValidator<CompleteDispensingCommand>
    {
        public CompleteDispensingCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Prescription id may not be empty.");
            RuleFor(c => c.PharmacistNotes)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Dispensing.EmptyReason).WithMessage("Notes may not exceed 2000 characters.")
                .When(c => c.PharmacistNotes != null);
        }
    }
}
