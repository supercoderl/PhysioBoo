using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Laboratory.UpdateLabResult
{
    public sealed class UpdateLabResultCommandValidation : AbstractValidator<UpdateLabResultCommand>
    {
        public UpdateLabResultCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.Value)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyValue).WithMessage("Result value may not be empty.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.LabWorkspace.ValueExceedsMaxLength).WithMessage("Result value may not exceed 200 characters.");

            RuleFor(c => c.Body.Comments)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.LabWorkspace.CommentsExceedsMaxLength).WithMessage("Comments may not exceed 2000 characters.");
        }
    }
}
