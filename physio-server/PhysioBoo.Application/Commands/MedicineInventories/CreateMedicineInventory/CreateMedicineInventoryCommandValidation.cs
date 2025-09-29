using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory
{
    public sealed class CreateMedicineInventoryCommandValidation : AbstractValidator<CreateMedicineInventoryCommand>
    {
        public CreateMedicineInventoryCommandValidation()
        {
            RuleForMedicineId();
            RuleForHospitalId();
            RuleForSupplierId();
        }

        public void RuleForMedicineId()
        {
            RuleFor(cmd => cmd.NewMedicineInventory.MedicineId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyMedicineId)
                .WithMessage("MedicineId may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewMedicineInventory.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptyHospitalId)
                .WithMessage("HospitalId may not be empty.");
        }

        public void RuleForSupplierId()
        {
            RuleFor(cmd => cmd.NewMedicineInventory.SupplierId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineInventory.EmptySupplierId)
                .WithMessage("SupplierId may not be empty.");
        }
    }
}
