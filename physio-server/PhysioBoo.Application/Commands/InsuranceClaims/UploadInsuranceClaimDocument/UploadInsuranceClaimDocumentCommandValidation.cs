using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceClaims.UploadInsuranceClaimDocument
{
    public sealed class UploadInsuranceClaimDocumentCommandValidation : AbstractValidator<UploadInsuranceClaimDocumentCommand>
    {
        public const long MaxFileSizeBytes = 20 * 1024 * 1024;

        public UploadInsuranceClaimDocumentCommandValidation()
        {
            RuleFor(c => c.ClaimId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyId).WithMessage("Claim id may not be empty.");

            RuleFor(c => c.File)
                .NotNull().WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyFile).WithMessage("File is required.");

            RuleFor(c => c.File.Length)
                .GreaterThan(0).WithErrorCode(DomainErrorCodes.InsuranceClaim.EmptyFile).WithMessage("File is empty.")
                .LessThanOrEqualTo(MaxFileSizeBytes).WithErrorCode(DomainErrorCodes.InsuranceClaim.FileTooLarge).WithMessage("File may not exceed 20 MB.")
                .When(c => c.File != null);

            RuleFor(c => c.DocumentType)
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.InsuranceClaim.InvalidAction).WithMessage("Document type may not exceed 32 characters.");
        }
    }
}
