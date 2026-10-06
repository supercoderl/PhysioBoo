using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateEquipmentItem
{
    public sealed class UpdateEquipmentItemCommand : CommandBase, IRequest
    {
        private static readonly UpdateEquipmentItemCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public Guid ItemId { get; }
        public UpdateEquipmentItemViewModel Input { get; }

        public SurgeryEquipmentItemViewModel? Result { get; set; }

        public UpdateEquipmentItemCommand(Guid surgeryId, Guid itemId, UpdateEquipmentItemViewModel input) : base(Guid.NewGuid())
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
