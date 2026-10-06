using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Commands.InsuranceClaims.AddInsuranceClaimActivity
{
    /// <summary>
    /// Adds an internal note (Kind = Note) or an insurer communication (Kind = Message) to a claim.
    /// </summary>
    public sealed class AddInsuranceClaimActivityCommand : CommandBase, IRequest
    {
        private static readonly AddInsuranceClaimActivityCommandValidation s_validation = new();

        public Guid ClaimId { get; }
        public Guid NewId { get; }
        public InsuranceClaimActivityKind Kind { get; }
        public string Message { get; }
        public string? Direction { get; }

        public AddInsuranceClaimActivityCommand(
            Guid claimId,
            Guid newId,
            InsuranceClaimActivityKind kind,
            string message,
            string? direction = null
        ) : base(claimId)
        {
            ClaimId = claimId;
            NewId = newId;
            Kind = kind;
            Message = message;
            Direction = direction;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
