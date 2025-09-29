using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommandValidation : AbstractValidator<CreateLabTestCommand>
    {
        public CreateLabTestCommandValidation()
        {
            RuleForTestName();
            RuleForCategoryId();
        }

        public void RuleForTestName()
        {
            RuleFor(cmd => cmd.NewLabTest.TestName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyTestName)
                .WithMessage("TestName may not be empty.");
        }

        public void RuleForCategoryId()
        {
            RuleFor(cmd => cmd.NewLabTest.CategoryId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyCategoryId)
                .WithMessage("CategoryId may not be empty.");
        }
    }
}
