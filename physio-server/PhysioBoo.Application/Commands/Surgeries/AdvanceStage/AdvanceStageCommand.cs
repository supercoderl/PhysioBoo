using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.AdvanceStage
{
    public sealed class AdvanceStageCommand : CommandBase, IRequest
    {
        private static readonly AdvanceStageCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public string Stage { get; }
        public AdvanceStageViewModel Input { get; }

        // Filled by the handler so the endpoint can return the updated case.
        public SurgeryCaseViewModel? Result { get; set; }

        public AdvanceStageCommand(Guid surgeryId, string stage, AdvanceStageViewModel input) : base(Guid.NewGuid())
        {
            SurgeryId = surgeryId;
            Stage = stage;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
