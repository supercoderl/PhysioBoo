

namespace PhysioBoo.Application.Commands.InventoryAlerts.AcknowledgeAlert
{
    public sealed class AcknowledgeAlertCommandValidation : AbstractValidator<AcknowledgeAlertCommand>
    {
        public AcknowledgeAlertCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithMessage("Id may not be empty.");
        }
    }
}
