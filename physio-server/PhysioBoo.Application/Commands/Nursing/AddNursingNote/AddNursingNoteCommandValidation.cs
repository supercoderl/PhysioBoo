using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.AddNursingNote
{
    public sealed class AddNursingNoteCommandValidation : AbstractValidator<AddNursingNoteCommand>
    {
        public AddNursingNoteCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.Content)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyContent).WithMessage("Note may not be empty.")
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Note may not exceed 4000 characters.");
        }
    }
}
