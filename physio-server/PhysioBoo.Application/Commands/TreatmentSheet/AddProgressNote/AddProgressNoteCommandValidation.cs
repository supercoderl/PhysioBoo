using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.TreatmentSheet.AddProgressNote
{
    public sealed class AddProgressNoteCommandValidation : AbstractValidator<AddProgressNoteCommand>
    {
        public AddProgressNoteCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.Type)
                .Must(v => Enum.TryParse(v, true, out ClinicalNoteType t) && Enum.IsDefined(t))
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidNoteType).WithMessage("Note type must be Doctor, Nursing or Consultation.");

            RuleFor(c => c.Input.Content)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyContent).WithMessage("Note may not be empty.")
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Treatment.TextExceedsMaxLength).WithMessage("Note may not exceed 4000 characters.");
        }
    }
}
