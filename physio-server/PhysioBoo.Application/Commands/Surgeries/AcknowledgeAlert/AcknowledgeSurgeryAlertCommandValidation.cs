using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.AcknowledgeAlert
{
    public sealed class AcknowledgeSurgeryAlertCommandValidation : AbstractValidator<AcknowledgeSurgeryAlertCommand>
    {
        public AcknowledgeSurgeryAlertCommandValidation()
        {
            RuleFor(c => c.AlertId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Alert id may not be empty.");

            RuleFor(c => c.Input.Note)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Note may not exceed 500 characters.")
                .When(c => c.Input.Note != null);
        }
    }
}
