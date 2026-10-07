using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.ReturnRadiologyReportForRevision
{
    public sealed class ReturnRadiologyReportForRevisionCommandValidation : AbstractValidator<ReturnRadiologyReportForRevisionCommand>
    {
        public ReturnRadiologyReportForRevisionCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.Reason)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyReason).WithMessage("Reason may not be empty.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.ReasonExceedsMaxLength).WithMessage("Reason may not exceed 500 characters.");
        }
    }
}
