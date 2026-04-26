using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany
{
    public sealed class UpdateInsuranceCompanyCommand : CommandBase
    {
        private static readonly UpdateInsuranceCompanyCommandValidation s_validation = new();

        public UpdateInsuranceCompanyViewModel InsuranceCompany { get; }
        public Guid Id { get; }

        public UpdateInsuranceCompanyCommand(UpdateInsuranceCompanyViewModel insuranceCompany, Guid id) : base(Guid.NewGuid())
        {
            InsuranceCompany = insuranceCompany;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
