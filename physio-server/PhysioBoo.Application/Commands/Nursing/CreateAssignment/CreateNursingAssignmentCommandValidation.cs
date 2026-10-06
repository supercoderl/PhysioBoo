using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.CreateAssignment
{
    public sealed class CreateNursingAssignmentCommandValidation : AbstractValidator<CreateNursingAssignmentCommand>
    {
        public CreateNursingAssignmentCommandValidation()
        {
            RuleFor(c => c.Input.AdmissionId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Admission may not be empty.");

            RuleFor(c => c.Input.Shift)
                .Must(v => Enum.TryParse(v, true, out ShiftCode s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Nursing.InvalidShift).WithMessage("Shift must be Day, Evening or Night.");

            RuleFor(c => c.Input.Acuity)
                .Must(v => Enum.TryParse(v, true, out AcuityLevel a) && Enum.IsDefined(a))
                .WithErrorCode(DomainErrorCodes.Nursing.InvalidAcuity).WithMessage("Acuity must be Low, Medium, High or Critical.");
        }
    }
}
