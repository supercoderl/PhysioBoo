using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.AcknowledgeAlert
{
    public sealed class AcknowledgeSurgeryAlertCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeSurgeryAlertCommandValidation s_validation = new();

        public Guid AlertId { get; }
        public AcknowledgeSurgeryAlertViewModel Input { get; }

        public AcknowledgeSurgeryAlertCommand(Guid alertId, AcknowledgeSurgeryAlertViewModel input) : base(Guid.NewGuid())
        {
            AlertId = alertId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
