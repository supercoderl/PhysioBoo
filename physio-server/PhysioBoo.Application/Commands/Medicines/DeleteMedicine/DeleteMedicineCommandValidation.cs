
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Medicines.DeleteMedicine
{
    public sealed class DeleteMedicineCommandValidation : AbstractValidator<DeleteMedicineCommand>
    {
        public DeleteMedicineCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Medicine.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
