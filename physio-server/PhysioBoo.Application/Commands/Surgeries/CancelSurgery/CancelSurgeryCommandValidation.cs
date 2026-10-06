using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.CancelSurgery
{
    public sealed class CancelSurgeryCommandValidation : AbstractValidator<CancelSurgeryCommand>
    {
        public CancelSurgeryCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyReason).WithMessage("A cancellation reason is required.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Reason may not exceed 500 characters.");
        }
    }
}
