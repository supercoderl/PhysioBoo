using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Laboratory.RejectLabSample
{
    public sealed class RejectLabSampleCommandValidation : AbstractValidator<RejectLabSampleCommand>
    {
        public RejectLabSampleCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyReason).WithMessage("Reason may not be empty.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.LabWorkspace.ReasonExceedsMaxLength).WithMessage("Reason may not exceed 500 characters.");
        }
    }
}
