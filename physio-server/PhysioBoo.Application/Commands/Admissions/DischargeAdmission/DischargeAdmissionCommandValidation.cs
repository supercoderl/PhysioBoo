using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Admissions.DischargeAdmission
{
    public sealed class DischargeAdmissionCommandValidation : AbstractValidator<DischargeAdmissionCommand>
    {
        public DischargeAdmissionCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.Notes)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Notes may not exceed 2000 characters.")
                .When(c => c.Input.Notes != null);
        }
    }
}
