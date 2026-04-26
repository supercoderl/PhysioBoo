using MediatR;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory
{
    public sealed class CreateLabTestCategoryCommand : CommandBase, IRequest
    {
        private static readonly CreateLabTestCategoryCommandValidation s_validation = new();

        public CreateLabTestCategoryViewModel NewLabTestCategory { get; }
        public Guid NewId { get; }

        public CreateLabTestCategoryCommand(CreateLabTestCategoryViewModel newLabTestCategory, Guid newId) : base(Guid.NewGuid())
        {
            NewLabTestCategory = newLabTestCategory;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
