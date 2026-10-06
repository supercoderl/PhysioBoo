using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.AddVitals
{
    public sealed class AddVitalsCommand : CommandBase, IRequest
    {
        private static readonly AddVitalsCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public AddVitalsViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new reading.
        public VitalsReadingViewModel? Result { get; set; }

        public AddVitalsCommand(Guid patientId, AddVitalsViewModel input) : base(Guid.NewGuid())
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
