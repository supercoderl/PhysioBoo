using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Laboratory.AcknowledgeLabAlert
{
    public sealed class AcknowledgeLabAlertCommandValidation : AbstractValidator<AcknowledgeLabAlertCommand>
    {
        public AcknowledgeLabAlertCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
