

namespace PhysioBoo.Application.Commands.Prescriptions.AcknowledgeClinicalWarning
{
    public sealed class AcknowledgeClinicalWarningCommandValidation : AbstractValidator<AcknowledgeClinicalWarningCommand>
    {
        public AcknowledgeClinicalWarningCommandValidation()
        {
            RuleFor(c => c.WarningId).NotEmpty();
        }
    }
}
