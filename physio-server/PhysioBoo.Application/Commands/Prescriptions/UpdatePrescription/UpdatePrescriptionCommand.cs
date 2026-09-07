
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Prescriptions.UpdatePrescription
{
    public sealed class UpdatePrescriptionCommand : CommandBase, IRequest
    {
        private static readonly UpdatePrescriptionCommandValidation s_validation = new();

        public UpdatePrescriptionViewModel Prescription { get; }

        public UpdatePrescriptionCommand(UpdatePrescriptionViewModel prescription) : base(Guid.NewGuid())
        {
            Prescription = prescription;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
