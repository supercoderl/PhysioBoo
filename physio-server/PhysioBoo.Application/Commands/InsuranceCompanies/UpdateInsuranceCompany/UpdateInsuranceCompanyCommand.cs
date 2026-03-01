using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany
{
    public sealed class UpdateInsuranceCompanyCommand : CommandBase
    {
        private static readonly UpdateInsuranceCompanyCommandValidation s_validation = new();

        public UpdateInsuranceCompanyViewModel InsuranceCompany { get; }

        public UpdateInsuranceCompanyCommand(UpdateInsuranceCompanyViewModel insuranceCompany) : base(Guid.NewGuid())
        {
            InsuranceCompany = insuranceCompany;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
