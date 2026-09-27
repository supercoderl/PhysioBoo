using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTestCategories.DeleteLabTestCategory
{
    public sealed class DeleteLabTestCategoryCommandValidation : AbstractValidator<DeleteLabTestCategoryCommand>
    {
        public DeleteLabTestCategoryCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTestCategory.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
