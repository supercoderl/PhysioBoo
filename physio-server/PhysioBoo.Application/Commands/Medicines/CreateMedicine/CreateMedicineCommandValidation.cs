using FluentValidation;

namespace PhysioBoo.Application.Commands.Medicines.CreateMedicine
{
    public sealed class CreateMedicineCommandValidation : AbstractValidator<CreateMedicineCommand>
    {
        public CreateMedicineCommandValidation()
        {

        }
    }
}
