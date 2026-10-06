using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceClaims.ProcessInsuranceClaim
{
    public sealed class ProcessInsuranceClaimCommandValidation : AbstractValidator<ProcessInsuranceClaimCommand>
    {
        public ProcessInsuranceClaimCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyId).WithMessage("Claim id may not be empty.");

            RuleFor(c => c.Action)
                .IsInEnum().WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidAction).WithMessage("Action is not valid.");

            RuleFor(c => c.Amount)
                .NotNull().GreaterThan(0).WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidAmount).WithMessage("Amount must be greater than 0.")
                .When(c => c.Action is InsuranceClaimAction.Approve or InsuranceClaimAction.Settle);

            RuleFor(c => c.Text)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyReason).WithMessage("A reason is required.")
                .When(c => c.Action is InsuranceClaimAction.Reject or InsuranceClaimAction.Appeal);

            RuleFor(c => c.Text)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.InsuranceClaim.MessageExceedsMaxLength).WithMessage("Text may not exceed 2000 characters.")
                .When(c => c.Text != null);

            RuleFor(c => c.Method)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptySettlementMethod).WithMessage("Settlement method is required.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptySettlementMethod).WithMessage("Settlement method may not exceed 32 characters.")
                .When(c => c.Action == InsuranceClaimAction.Settle);
        }
    }
}
