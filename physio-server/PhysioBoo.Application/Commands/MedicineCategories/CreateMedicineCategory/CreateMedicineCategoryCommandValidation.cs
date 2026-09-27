using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory
{
    public sealed class CreateMedicineCategoryCommandValidation : AbstractValidator<CreateMedicineCategoryCommand>
    {
        public CreateMedicineCategoryCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewMedicineCategory.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineCategory.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }
    }
}
