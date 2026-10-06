using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.AddFavoriteMedication
{
    public sealed class AddFavoriteMedicationCommandValidation : AbstractValidator<AddFavoriteMedicationCommand>
    {
        public AddFavoriteMedicationCommandValidation()
        {
            RuleFor(c => c.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyDoctor).WithMessage("Doctor is required.");
            RuleFor(c => c.Favorite.MedicineId).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyMedicine).WithMessage("Medicine is required.");
            RuleFor(c => c.Favorite.DurationDays)
                .InclusiveBetween(1, 365).WithErrorCode(DomainErrorCodes.PrescriptionTemplate.InvalidDuration).WithMessage("Duration must be between 1 and 365 days.")
                .When(c => c.Favorite.DurationDays.HasValue);
        }
    }
}
