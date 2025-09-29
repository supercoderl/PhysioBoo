using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory
{
    public sealed class CreateLabTestCategoryCommandValidation : AbstractValidator<CreateLabTestCategoryCommand>
    {
        public CreateLabTestCategoryCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewLabTestCategory.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTestCategory.EmptyName)
                .WithMessage("Name may not be empty.");
        }
    }
}
