using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.AcknowledgeAlert
{
    public sealed class AcknowledgeAlertCommandValidation : AbstractValidator<AcknowledgeAlertCommand>
    {
        public AcknowledgeAlertCommandValidation()
        {
            RuleFor(c => c.AlertId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Alert id may not be empty.");

            RuleFor(c => c.Input.Note)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Note may not exceed 500 characters.")
                .When(c => c.Input.Note != null);
        }
    }
}
