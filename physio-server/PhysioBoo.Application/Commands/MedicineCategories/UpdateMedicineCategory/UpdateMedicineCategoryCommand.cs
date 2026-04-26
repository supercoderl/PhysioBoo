using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineCategories.UpdateMedicineCategory
{
    public sealed class UpdateMedicineCategoryCommand : CommandBase
    {
        private static readonly UpdateMedicineCategoryCommandValidation s_validation = new();

        public UpdateMedicineCategoryViewModel MedicineCategory { get; }
        public Guid Id { get; }

        public UpdateMedicineCategoryCommand(UpdateMedicineCategoryViewModel medicineCategory, Guid id) : base(Guid.NewGuid())
        {
            MedicineCategory = medicineCategory;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
