using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateIntraOp
{
    public sealed class UpdateIntraOpCommand : CommandBase, IRequest
    {
        private static readonly UpdateIntraOpCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public UpdateIntraOpViewModel Input { get; }

        public SurgeryCaseViewModel? Result { get; set; }

        public UpdateIntraOpCommand(Guid surgeryId, UpdateIntraOpViewModel input) : base(Guid.NewGuid())
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
