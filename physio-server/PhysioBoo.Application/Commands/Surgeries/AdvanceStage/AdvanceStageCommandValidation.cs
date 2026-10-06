using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.AdvanceStage
{
    public sealed class AdvanceStageCommandValidation : AbstractValidator<AdvanceStageCommand>
    {
        public AdvanceStageCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");

            // "Scheduled" is recorded when the case is created, so it can never be advanced to.
            RuleFor(c => c.Stage)
                .Must(v => Enum.TryParse(v, true, out SurgeryTimelineStage s) && s != SurgeryTimelineStage.Scheduled)
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidStage).WithMessage("Stage is not a valid surgery stage.");
        }
    }
}
