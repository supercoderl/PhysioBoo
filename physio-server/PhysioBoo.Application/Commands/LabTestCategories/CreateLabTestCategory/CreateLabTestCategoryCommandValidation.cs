using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory
{
    public sealed class CreateLabTestCategoryCommandValidation : AbstractValidator<CreateLabTestCategoryCommand>
    {
        public CreateLabTestCategoryCommandValidation()
        {
            RuleForName();
            RuleForDepartment();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewLabTestCategory.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTestCategory.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForDepartment()
        {
            RuleFor(cmd => cmd.NewLabTestCategory.Department).MaxLen(100, "Department");
        }
    }
}
