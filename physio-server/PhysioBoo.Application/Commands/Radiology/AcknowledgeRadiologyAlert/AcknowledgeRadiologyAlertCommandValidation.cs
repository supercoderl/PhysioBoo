using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.AcknowledgeRadiologyAlert
{
    public sealed class AcknowledgeRadiologyAlertCommandValidation : AbstractValidator<AcknowledgeRadiologyAlertCommand>
    {
        public AcknowledgeRadiologyAlertCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
