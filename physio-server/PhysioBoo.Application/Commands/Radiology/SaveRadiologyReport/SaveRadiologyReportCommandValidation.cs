using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.SaveRadiologyReport
{
    public sealed class SaveRadiologyReportCommandValidation : AbstractValidator<SaveRadiologyReportCommand>
    {
        public SaveRadiologyReportCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.ClinicalIndication)
                .MaximumLength(10000).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.TextExceedsMaxLength).WithMessage("ClinicalIndication may not exceed 10000 characters.");

            RuleFor(c => c.Body.Technique)
                .MaximumLength(10000).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.TextExceedsMaxLength).WithMessage("Technique may not exceed 10000 characters.");

            RuleFor(c => c.Body.Findings)
                .MaximumLength(10000).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.TextExceedsMaxLength).WithMessage("Findings may not exceed 10000 characters.");

            RuleFor(c => c.Body.Impression)
                .MaximumLength(10000).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.TextExceedsMaxLength).WithMessage("Impression may not exceed 10000 characters.");

            RuleFor(c => c.Body.Recommendations)
                .MaximumLength(10000).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.TextExceedsMaxLength).WithMessage("Recommendations may not exceed 10000 characters.");
        }
    }
}
