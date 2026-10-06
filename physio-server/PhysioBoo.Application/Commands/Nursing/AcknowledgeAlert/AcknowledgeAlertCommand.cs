using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.AcknowledgeAlert
{
    // Used by both the nursing dashboard and the treatment sheet.
    public sealed class AcknowledgeAlertCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeAlertCommandValidation s_validation = new();

        public Guid AlertId { get; }
        public AcknowledgeAlertViewModel Input { get; }

        public AcknowledgeAlertCommand(Guid alertId, AcknowledgeAlertViewModel input) : base(Guid.NewGuid())
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
