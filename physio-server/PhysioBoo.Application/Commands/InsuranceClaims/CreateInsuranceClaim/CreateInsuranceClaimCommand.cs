using PhysioBoo.Application.ViewModels.InsuranceClaims;

namespace PhysioBoo.Application.Commands.InsuranceClaims.CreateInsuranceClaim
{
    public sealed class CreateInsuranceClaimCommand : CommandBase, IRequest
    {
        private static readonly CreateInsuranceClaimCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateInsuranceClaimViewModel NewClaim { get; }

        public CreateInsuranceClaimCommand(Guid newId, CreateInsuranceClaimViewModel newClaim) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewClaim = newClaim;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
