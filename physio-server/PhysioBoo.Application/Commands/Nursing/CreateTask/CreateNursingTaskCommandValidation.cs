using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.CreateTask
{
    public sealed class CreateNursingTaskCommandValidation : AbstractValidator<CreateNursingTaskCommand>
    {
        public CreateNursingTaskCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.Label)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyLabel).WithMessage("Label may not be empty.")
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Label may not exceed 255 characters.");

            RuleFor(c => c.Input.AssignedNurseName)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Nurse name may not exceed 120 characters.")
                .When(c => c.Input.AssignedNurseName != null);
        }
    }
}
