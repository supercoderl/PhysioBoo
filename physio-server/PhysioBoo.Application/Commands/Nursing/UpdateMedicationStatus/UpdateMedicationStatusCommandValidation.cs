using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.UpdateMedicationStatus
{
    public sealed class UpdateMedicationStatusCommandValidation : AbstractValidator<UpdateMedicationStatusCommand>
    {
        public UpdateMedicationStatusCommandValidation()
        {
            RuleFor(c => c.EntryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Entry id may not be empty.");

            // A dose is recorded as given, missed, refused or held; it never goes back to Scheduled.
            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out AdministrationStatus s) && Enum.IsDefined(s) && s != AdministrationStatus.Scheduled)
                .WithErrorCode(DomainErrorCodes.Nursing.InvalidStatus).WithMessage("Status must be Given, Missed, Refused or Held.");

            RuleFor(c => c.Input.Reason)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Reason may not exceed 1000 characters.")
                .When(c => c.Input.Reason != null);

            RuleFor(c => c.Input.Notes)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Notes may not exceed 1000 characters.")
                .When(c => c.Input.Notes != null);
        }
    }
}
