
using PhysioBoo.Application.ViewModels.PrescriptionItems;


namespace PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem
{
    public sealed class CreatePrescriptionItemCommand : CommandBase, IRequest
    {
        private static readonly CreatePrescriptionItemCommandValidation s_validation = new();

        public CreatePrescriptionItemViewModel NewPrescriptionItem { get; }

        public CreatePrescriptionItemCommand(CreatePrescriptionItemViewModel newPrescriptionItem) : base(Guid.NewGuid())
        {
            NewPrescriptionItem = newPrescriptionItem;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
