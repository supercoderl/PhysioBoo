using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTestCategories.UpdateLabTestCategory
{
    public sealed class UpdateLabTestCategoryCommand : CommandBase
    {
        private static readonly UpdateLabTestCategoryCommandValidation s_validation = new();

        public UpdateLabTestCategoryViewModel LabTestCategory { get; }

        public UpdateLabTestCategoryCommand(UpdateLabTestCategoryViewModel labTestCategory) : base(Guid.NewGuid())
        {
            LabTestCategory = labTestCategory;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
