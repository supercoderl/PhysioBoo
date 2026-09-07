
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.InventoryAlerts.AcknowledgeAlert
{
    public sealed class AcknowledgeAlertCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeAlertCommandValidation s_validation = new();

        public Guid Id { get; }

        public AcknowledgeAlertCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
