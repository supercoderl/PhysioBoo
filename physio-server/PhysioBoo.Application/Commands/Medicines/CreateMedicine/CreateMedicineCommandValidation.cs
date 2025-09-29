using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Medicines.CreateMedicine
{
    public sealed class CreateMedicineCommandValidation : AbstractValidator<CreateMedicineCommand>
    {
        public CreateMedicineCommandValidation()
        {
            RuleForName();
            RuleForCategoryId();
            RuleForManufacturerId();
            RuleForWarningLabels();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewMedicine.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyName)
                .WithMessage("Name may not be empty.");
        }

        public void RuleForCategoryId()
        {
            RuleFor(cmd => cmd.NewMedicine.CategoryId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyCategoryId)
                .WithMessage("CategoryId may not be empty.");
        }

        public void RuleForManufacturerId()
        {
            RuleFor(cmd => cmd.NewMedicine.ManufacturerId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyManufacturerId)
                .WithMessage("ManufacturerId may not be empty.");
        }

        public void RuleForWarningLabels()
        {
            RuleFor(cmd => cmd.NewMedicine.WarningLabels)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyWarningLabels)
                .WithMessage("WarningLabels may not be empty.");
        }
    }
}
