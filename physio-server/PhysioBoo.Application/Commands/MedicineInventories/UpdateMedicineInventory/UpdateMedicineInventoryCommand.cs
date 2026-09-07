
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.UpdateMedicineInventory
{
    public sealed class UpdateMedicineInventoryCommand : CommandBase, IRequest
    {
        private static readonly UpdateMedicineInventoryCommandValidation s_validation = new();

        public UpdateMedicineInventoryViewModel MedicineInventory { get; }
        public Guid Id { get; }

        public UpdateMedicineInventoryCommand(UpdateMedicineInventoryViewModel medicineInventory, Guid id) : base(Guid.NewGuid())
        {
            MedicineInventory = medicineInventory;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
