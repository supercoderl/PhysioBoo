
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Prescriptions.IssuePrescription
{
    public sealed class IssuePrescriptionCommand : CommandBase, IRequest
    {
        private static readonly IssuePrescriptionCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }

        public IssuePrescriptionCommand(Guid prescriptionId) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
