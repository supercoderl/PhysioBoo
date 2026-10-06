using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceClaims.AddInsuranceClaimActivity
{
    public sealed class AddInsuranceClaimActivityCommandValidation : AbstractValidator<AddInsuranceClaimActivityCommand>
    {
        public AddInsuranceClaimActivityCommandValidation()
        {
            RuleFor(c => c.ClaimId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyId).WithMessage("Claim id may not be empty.");

            RuleFor(c => c.Kind)
                .Must(k => k is InsuranceClaimActivityKind.Note or InsuranceClaimActivityKind.Message)
                .WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidAction).WithMessage("Only notes and messages can be added.");

            RuleFor(c => c.Message)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyMessage).WithMessage("Message may not be empty.")
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.InsuranceClaim.MessageExceedsMaxLength).WithMessage("Message may not exceed 4000 characters.");

            RuleFor(c => c.Direction)
                .Must(d => d is null || d == "Inbound" || d == "Outbound")
                .WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidAction).WithMessage("Direction must be Inbound or Outbound.");
        }
    }
}
