using Microsoft.AspNetCore.Http;

namespace PhysioBoo.Application.Commands.InsuranceClaims.UploadInsuranceClaimDocument
{
    public sealed class UploadInsuranceClaimDocumentCommand : CommandBase, IRequest
    {
        private static readonly UploadInsuranceClaimDocumentCommandValidation s_validation = new();

        public Guid ClaimId { get; }
        public IFormFile File { get; }
        public string DocumentType { get; }

        /// <summary>
        /// Set by the handler: the document row the file was stored on.
        /// </summary>
        public Guid? DocumentId { get; set; }

        public UploadInsuranceClaimDocumentCommand(Guid claimId, IFormFile file, string documentType) : base(claimId)
        {
            ClaimId = claimId;
            File = file;
            DocumentType = documentType;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
