using MediatR;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory
{
    public sealed class CreateMedicineCategoryCommand : CommandBase, IRequest
    {
        private static readonly CreateMedicineCategoryCommandValidation s_validation = new();

        public CreateMedicineCategoryViewModel NewMedicineCategory { get; }
        public Guid NewId { get; }

        public CreateMedicineCategoryCommand(CreateMedicineCategoryViewModel newMedicineCategory, Guid newId) : base(Guid.NewGuid())
        {
            NewMedicineCategory = newMedicineCategory;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
