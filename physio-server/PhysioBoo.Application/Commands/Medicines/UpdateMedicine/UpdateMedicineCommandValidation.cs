
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Medicines.UpdateMedicine
{
    public sealed class UpdateMedicineCommandValidation : AbstractValidator<UpdateMedicineCommand>
    {
        public UpdateMedicineCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForCategoryId();
            RuleForManufacturerId();
            RuleForWarningLabels();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.Medicine.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyName)
                .WithMessage("Name may not be empty.");
        }

        public void RuleForCategoryId()
        {
            RuleFor(cmd => cmd.Medicine.CategoryId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyCategoryId)
                .WithMessage("CategoryId may not be empty.");
        }

        public void RuleForManufacturerId()
        {
            RuleFor(cmd => cmd.Medicine.ManufacturerId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyManufacturerId)
                .WithMessage("ManufacturerId may not be empty.");
        }

        public void RuleForWarningLabels()
        {
            RuleFor(cmd => cmd.Medicine.WarningLabels)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyWarningLabels)
                .WithMessage("WarningLabels may not be empty.");
        }
    }
}
