using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceClaims.CreateInsuranceClaim
{
    public sealed class CreateInsuranceClaimCommandValidation : AbstractValidator<CreateInsuranceClaimCommand>
    {
        public CreateInsuranceClaimCommandValidation()
        {
            RuleFor(c => c.NewClaim.PatientName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyPatientName).WithMessage("Patient name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.InsuranceClaim.PatientNameExceedsMaxLength).WithMessage("Patient name may not exceed 120 characters.");

            RuleFor(c => c.NewClaim.ProviderId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyProvider).WithMessage("Insurance provider is required.");

            RuleFor(c => c.NewClaim.PolicyNumber)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyPolicyNumber).WithMessage("Policy number may not be empty.")
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.InsuranceClaim.PolicyNumberExceedsMaxLength).WithMessage("Policy number may not exceed 64 characters.");

            RuleFor(c => c.NewClaim.Diagnosis)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyDiagnosis).WithMessage("Diagnosis may not be empty.")
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.InsuranceClaim.DiagnosisExceedsMaxLength).WithMessage("Diagnosis may not exceed 500 characters.");

            RuleFor(c => c.NewClaim.ClaimAmount)
                .GreaterThan(0).WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidAmount).WithMessage("Claim amount must be greater than 0.");

            RuleFor(c => c.NewClaim.Priority)
                .Must(v => Enum.TryParse(v, true, out InsuranceClaimPriority p) && Enum.IsDefined(p))
                .WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidPriority).WithMessage("Priority is not valid.");
        }
    }
}
