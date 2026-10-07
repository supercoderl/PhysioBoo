using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Laboratory.ApproveLabResult
{
    public sealed class ApproveLabResultCommandValidation : AbstractValidator<ApproveLabResultCommand>
    {
        public ApproveLabResultCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
