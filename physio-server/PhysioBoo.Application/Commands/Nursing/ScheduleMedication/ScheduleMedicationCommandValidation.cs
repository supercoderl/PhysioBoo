using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.ScheduleMedication
{
    public sealed class ScheduleMedicationCommandValidation : AbstractValidator<ScheduleMedicationCommand>
    {
        public ScheduleMedicationCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.MedicationName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyMedicationName).WithMessage("Medication name may not be empty.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Medication name may not exceed 200 characters.");

            RuleFor(c => c.Input.Dose)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyMedicationName).WithMessage("Dose may not be empty.")
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Dose may not exceed 64 characters.");

            RuleFor(c => c.Input.Route)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyMedicationName).WithMessage("Route may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Route may not exceed 32 characters.");

            RuleFor(c => c.Input.Frequency)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyMedicationName).WithMessage("Frequency may not be empty.")
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Frequency may not exceed 64 characters.");
        }
    }
}
