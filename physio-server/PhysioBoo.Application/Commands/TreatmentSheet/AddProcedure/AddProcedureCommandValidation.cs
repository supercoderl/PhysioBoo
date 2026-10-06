using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.TreatmentSheet.AddProcedure
{
    public sealed class AddProcedureCommandValidation : AbstractValidator<AddProcedureCommand>
    {
        public AddProcedureCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyProcedureName).WithMessage("Procedure name may not be empty.")
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.Treatment.TextExceedsMaxLength).WithMessage("Procedure name may not exceed 255 characters.");

            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out TreatmentProcedureStatus s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidStatus).WithMessage("Status is not valid.");

            RuleFor(c => c.Input.Department)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyDepartment).WithMessage("Department may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Treatment.TextExceedsMaxLength).WithMessage("Department may not exceed 120 characters.");

            RuleFor(c => c.Input.PerformerName)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Treatment.TextExceedsMaxLength).WithMessage("Performer name may not exceed 120 characters.")
                .When(c => c.Input.PerformerName != null);

            RuleFor(c => c.Input)
                .Must(v => !v.CompletionTime.HasValue || v.CompletionTime >= v.ScheduledTime)
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidDateRange).WithMessage("Completion time may not be before the scheduled time.");
        }
    }
}
