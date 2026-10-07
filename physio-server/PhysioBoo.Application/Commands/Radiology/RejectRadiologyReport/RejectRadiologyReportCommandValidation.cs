using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.RejectRadiologyReport
{
    public sealed class RejectRadiologyReportCommandValidation : AbstractValidator<RejectRadiologyReportCommand>
    {
        public RejectRadiologyReportCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyReason).WithMessage("Reason may not be empty.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.ReasonExceedsMaxLength).WithMessage("Reason may not exceed 500 characters.");
        }
    }
}
