using MediatR;
using PhysioBoo.Application.ViewModels.Medicines;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Medicines.CreateMedicine
{
    public sealed class CreateMedicineCommand : CommandBase, IRequest
    {
        private static readonly CreateMedicineCommandValidation s_validation = new();

        public CreateMedicineViewModel NewMedicine { get; }

        public CreateMedicineCommand(CreateMedicineViewModel newMedicine) : base(Guid.NewGuid())
        {
            NewMedicine = newMedicine;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
