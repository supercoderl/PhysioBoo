using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.AddIntakeOutput
{
    public sealed class AddIntakeOutputCommandValidation : AbstractValidator<AddIntakeOutputCommand>
    {
        public AddIntakeOutputCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.Direction)
                .Must(v => Enum.TryParse(v, true, out IntakeOutputDirection d) && Enum.IsDefined(d))
                .WithErrorCode(DomainErrorCodes.Nursing.InvalidDirection).WithMessage("Direction must be Intake or Output.");

            RuleFor(c => c.Input.Category)
                .Must(v => Enum.TryParse(v, true, out IntakeOutputCategory c) && Enum.IsDefined(c))
                .WithErrorCode(DomainErrorCodes.Nursing.InvalidCategory).WithMessage("Category is not valid.");

            RuleFor(c => c.Input.VolumeMl)
                .InclusiveBetween(1, 10000).WithErrorCode(DomainErrorCodes.Nursing.InvalidVolume).WithMessage("Volume must be between 1 and 10,000 ml.");

            RuleFor(c => c.Input.Notes)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Nursing.TextExceedsMaxLength).WithMessage("Notes may not exceed 500 characters.")
                .When(c => c.Input.Notes != null);
        }
    }
}
