using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTestCategories.DeleteLabTestCategory
{
    public sealed class DeleteLabTestCategoryCommand : CommandBase
    {
        private static readonly DeleteLabTestCategoryCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteLabTestCategoryCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
