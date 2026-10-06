using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Commands.TreatmentSheet.CreateOrder
{
    public sealed class CreateTreatmentOrderCommand : CommandBase, IRequest
    {
        private static readonly CreateTreatmentOrderCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public CreateTreatmentOrderViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new order.
        public TreatmentOrderViewModel? Result { get; set; }

        public CreateTreatmentOrderCommand(Guid patientId, CreateTreatmentOrderViewModel input) : base(Guid.NewGuid())
        {
            PatientId = patientId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
