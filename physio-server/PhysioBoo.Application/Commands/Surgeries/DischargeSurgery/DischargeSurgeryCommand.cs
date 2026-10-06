using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.DischargeSurgery
{
    public sealed class DischargeSurgeryCommand : CommandBase, IRequest
    {
        private static readonly DischargeSurgeryCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public AdvanceStageViewModel Input { get; }

        public SurgeryCaseViewModel? Result { get; set; }

        public DischargeSurgeryCommand(Guid surgeryId, AdvanceStageViewModel input) : base(Guid.NewGuid())
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
