
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Prescriptions.AcknowledgeClinicalWarning
{
    public sealed class AcknowledgeClinicalWarningCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeClinicalWarningCommandValidation s_validation = new();

        public Guid WarningId { get; }

        public AcknowledgeClinicalWarningCommand(Guid warningId) : base(warningId)
        {
            WarningId = warningId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
