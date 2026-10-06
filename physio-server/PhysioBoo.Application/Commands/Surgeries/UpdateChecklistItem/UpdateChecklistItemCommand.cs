using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateChecklistItem
{
    public sealed class UpdateChecklistItemCommand : CommandBase, IRequest
    {
        private static readonly UpdateChecklistItemCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public Guid ItemId { get; }
        public UpdateChecklistItemViewModel Input { get; }

        public PreOpChecklistItemViewModel? Result { get; set; }

        public UpdateChecklistItemCommand(Guid surgeryId, Guid itemId, UpdateChecklistItemViewModel input) : base(Guid.NewGuid())
        {
            SurgeryId = surgeryId;
            ItemId = itemId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
