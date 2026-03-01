using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineCategories.UpdateMedicineCategory
{
    public sealed class UpdateMedicineCategoryCommand : CommandBase
    {
        private static readonly UpdateMedicineCategoryCommandValidation s_validation = new();

        public UpdateMedicineCategoryViewModel MedicineCategory { get; }

        public UpdateMedicineCategoryCommand(UpdateMedicineCategoryViewModel medicineCategory) : base(Guid.NewGuid())
        {
            MedicineCategory = medicineCategory;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
