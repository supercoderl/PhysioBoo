using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.UpdatePostOp
{
    public sealed class UpdatePostOpCommand : CommandBase, IRequest
    {
        private static readonly UpdatePostOpCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public UpdatePostOpViewModel Input { get; }

        public SurgeryCaseViewModel? Result { get; set; }

        public UpdatePostOpCommand(Guid surgeryId, UpdatePostOpViewModel input) : base(Guid.NewGuid())
        {
            SurgeryId = surgeryId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
