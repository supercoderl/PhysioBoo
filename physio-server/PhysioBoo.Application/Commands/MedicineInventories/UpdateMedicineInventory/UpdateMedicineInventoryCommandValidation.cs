
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.UpdateMedicineInventory
{
    public sealed class UpdateMedicineInventoryCommandValidation : AbstractValidator<UpdateMedicineInventoryCommand>
    {
        public UpdateMedicineInventoryCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyId)
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.MedicineInventory.MaximumStockLevel)
                .GreaterThanOrEqualTo(cmd => cmd.MedicineInventory.MinimumStockLevel)
                .WithMessage("MaximumStockLevel must be greater than or equal to MinimumStockLevel.");
        }
    }
}
