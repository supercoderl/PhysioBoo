using MediatR;
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory
{
    public sealed class CreateMedicineInventoryCommand : CommandBase, IRequest
    {
        private static readonly CreateMedicineInventoryCommandValidation s_validation = new();

        public CreateMedicineInventoryViewModel NewMedicineInventory { get; }

        public CreateMedicineInventoryCommand(CreateMedicineInventoryViewModel newMedicineInventory) : base(Guid.NewGuid())
        {
            NewMedicineInventory = newMedicineInventory;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
