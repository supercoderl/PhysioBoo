using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.ApproveRadiologyReport
{
    public sealed class ApproveRadiologyReportCommandValidation : AbstractValidator<ApproveRadiologyReportCommand>
    {
        public ApproveRadiologyReportCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
