using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.UpdatePostOp
{
    public sealed class UpdatePostOpCommandValidation : AbstractValidator<UpdatePostOpCommand>
    {
        public UpdatePostOpCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");

            RuleFor(c => c.Input.PacuBay)
                .MaximumLength(50).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("PACU bay may not exceed 50 characters.")
                .When(c => c.Input.PacuBay != null);

            RuleFor(c => c.Input.RecoveryStatus)
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Recovery status may not exceed 200 characters.")
                .When(c => c.Input.RecoveryStatus != null);

            RuleFor(c => c.Input.PostOpNotes)
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Post-operative notes may not exceed 4000 characters.")
                .When(c => c.Input.PostOpNotes != null);

            RuleFor(c => c.Input.Complications)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Complications may not exceed 2000 characters.")
                .When(c => c.Input.Complications != null);

            RuleFor(c => c.Input.FollowUpOrders)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Follow-up orders may not exceed 2000 characters.")
                .When(c => c.Input.FollowUpOrders != null);
        }
    }
}
