using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.CancelSurgery
{
    public sealed class CancelSurgeryCommand : CommandBase, IRequest
    {
        private static readonly CancelSurgeryCommandValidation s_validation = new();

        public Guid Id { get; }
        public CancelSurgeryViewModel Input { get; }

        // Filled by the handler so the endpoint can return the updated case.
        public SurgeryCaseViewModel? Result { get; set; }

        public CancelSurgeryCommand(Guid id, CancelSurgeryViewModel input) : base(Guid.NewGuid())
        {
            Id = id;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
