using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.AddIntakeOutput
{
    public sealed class AddIntakeOutputCommand : CommandBase, IRequest
    {
        private static readonly AddIntakeOutputCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public AddIntakeOutputViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new entry.
        public IntakeOutputEntryViewModel? Result { get; set; }

        public AddIntakeOutputCommand(Guid patientId, AddIntakeOutputViewModel input) : base(Guid.NewGuid())
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
