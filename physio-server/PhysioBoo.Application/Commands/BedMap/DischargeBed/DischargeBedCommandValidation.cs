using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.DischargeBed
{
    public sealed class DischargeBedCommandValidation : AbstractValidator<DischargeBedCommand>
    {
        public DischargeBedCommandValidation()
        {
            RuleFor(c => c.BedId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyId).WithMessage("Bed id may not be empty.");

            RuleFor(c => c.Input.Notes)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Bed.NotesExceedsMaxLength).WithMessage("Notes may not exceed 1000 characters.")
                .When(c => c.Input.Notes != null);
        }
    }
}
