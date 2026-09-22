
using PhysioBoo.Application.ViewModels.Prescriptions;


namespace PhysioBoo.Application.Commands.Prescriptions.CancelPrescription
{
    public sealed class CancelPrescriptionCommand : CommandBase, IRequest
    {
        private static readonly CancelPrescriptionCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public CancelPrescriptionViewModel Prescription { get; }

        public CancelPrescriptionCommand(Guid prescriptionId, CancelPrescriptionViewModel prescription) : base(Guid.NewGuid())
        {
            PrescriptionId = prescriptionId;
            Prescription = prescription;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
