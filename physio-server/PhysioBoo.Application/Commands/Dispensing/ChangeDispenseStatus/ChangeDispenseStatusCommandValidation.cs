using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dispensing.ChangeDispenseStatus
{
    public sealed class ChangeDispenseStatusCommandValidation : AbstractValidator<ChangeDispenseStatusCommand>
    {
        public ChangeDispenseStatusCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Prescription id may not be empty.");
            RuleFor(c => c.Action).IsInEnum().WithErrorCode(DomainErrorCodes.Dispensing.InvalidStatus).WithMessage("Action is not valid.");
            RuleFor(c => c.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyReason).WithMessage("A reason is required.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Dispensing.EmptyReason).WithMessage("Reason may not exceed 500 characters.");
        }
    }
}
