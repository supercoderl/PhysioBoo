using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.DeleteInsuranceCompany
{
    public sealed class DeleteInsuranceCompanyCommand : CommandBase
    {
        private static readonly DeleteInsuranceCompanyCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteInsuranceCompanyCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
