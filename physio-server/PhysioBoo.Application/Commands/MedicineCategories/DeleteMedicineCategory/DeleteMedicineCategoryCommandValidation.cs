using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicineCategories.DeleteMedicineCategory
{
    public sealed class DeleteMedicineCategoryCommandValidation : AbstractValidator<DeleteMedicineCategoryCommand>
    {
        public DeleteMedicineCategoryCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicineCategory.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
