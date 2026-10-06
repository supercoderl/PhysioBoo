using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.AssignPatient
{
    public sealed class AssignPatientCommandValidation : AbstractValidator<AssignPatientCommand>
    {
        public AssignPatientCommandValidation()
        {
            RuleFor(c => c.BedId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyId).WithMessage("Bed id may not be empty.");

            RuleFor(c => c.Input.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.Notes)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Bed.NotesExceedsMaxLength).WithMessage("Notes may not exceed 1000 characters.")
                .When(c => c.Input.Notes != null);
        }
    }
}
