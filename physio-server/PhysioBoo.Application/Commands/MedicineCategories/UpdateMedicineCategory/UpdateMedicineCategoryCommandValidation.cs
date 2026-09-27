using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineCategories.UpdateMedicineCategory
{
    public sealed class UpdateMedicineCategoryCommandValidation : AbstractValidator<UpdateMedicineCategoryCommand>
    {
        public UpdateMedicineCategoryCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForParentCategoryId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineCategory.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.MedicineCategory.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineCategory.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForParentCategoryId()
        {
            RuleFor(cmd => cmd.MedicineCategory.ParentCategoryId)
                .NotEqual(cmd => (Guid?)cmd.Id)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("A category cannot be its own parent.");
        }
    }
}
