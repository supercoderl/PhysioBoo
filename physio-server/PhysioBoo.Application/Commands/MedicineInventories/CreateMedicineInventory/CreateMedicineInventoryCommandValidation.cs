using FluentValidation;

namespace PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory
{
    public sealed class CreateMedicineInventoryCommandValidation : AbstractValidator<CreateMedicineInventoryCommand>
    {
        public CreateMedicineInventoryCommandValidation()
        {

        }
    }
}
