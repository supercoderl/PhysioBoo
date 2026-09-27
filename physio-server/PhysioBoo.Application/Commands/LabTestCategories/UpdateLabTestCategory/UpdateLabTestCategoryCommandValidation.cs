using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTestCategories.UpdateLabTestCategory
{
    public sealed class UpdateLabTestCategoryCommandValidation : AbstractValidator<UpdateLabTestCategoryCommand>
    {
        public UpdateLabTestCategoryCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForDepartment();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTestCategory.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.LabTestCategory.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTestCategory.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForDepartment()
        {
            RuleFor(cmd => cmd.LabTestCategory.Department).MaxLen(100, "Department");
        }
    }
}
