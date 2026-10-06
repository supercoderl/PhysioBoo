using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateIntraOp
{
    public sealed class UpdateIntraOpCommandValidation : AbstractValidator<UpdateIntraOpCommand>
    {
        public UpdateIntraOpCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");

            RuleFor(c => c.Input.Notes)
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Notes may not exceed 4000 characters.")
                .When(c => c.Input.Notes != null);

            RuleFor(c => c.Input.Complications)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Complications may not exceed 2000 characters.")
                .When(c => c.Input.Complications != null);

            RuleFor(c => c.Input.BloodLossMl!.Value)
                .InclusiveBetween(0, 20000).WithErrorCode(DomainErrorCodes.Surgery.InvalidValue).WithMessage("Blood loss must be between 0 and 20000 ml.")
                .When(c => c.Input.BloodLossMl.HasValue);

            RuleFor(c => c.Input.EstimatedRemainingMinutes!.Value)
                .InclusiveBetween(0, 1440).WithErrorCode(DomainErrorCodes.Surgery.InvalidValue).WithMessage("Estimated remaining time must be between 0 and 1440 minutes.")
                .When(c => c.Input.EstimatedRemainingMinutes.HasValue);
        }
    }
}
