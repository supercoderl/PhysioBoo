using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineCategories.DeleteMedicineCategory
{
    public sealed class DeleteMedicineCategoryCommand : CommandBase
    {
        private static readonly DeleteMedicineCategoryCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteMedicineCategoryCommand(
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
