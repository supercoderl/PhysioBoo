using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.RemoveFavoriteMedication
{
    public sealed class RemoveFavoriteMedicationCommandValidation : AbstractValidator<RemoveFavoriteMedicationCommand>
    {
        public RemoveFavoriteMedicationCommandValidation()
        {
            RuleFor(c => c.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyDoctor).WithMessage("Doctor is required.");
            RuleFor(c => c.FavoriteId).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyMedicine).WithMessage("Favorite id is required.");
        }
    }
}
