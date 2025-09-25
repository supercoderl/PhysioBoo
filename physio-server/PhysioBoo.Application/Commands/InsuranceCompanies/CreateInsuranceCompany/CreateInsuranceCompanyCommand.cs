using MediatR;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommand : CommandBase, IRequest
    {
        private static readonly CreateInsuranceCompanyCommandValidation s_validation = new();

        public CreateInsuranceCompanyViewModel NewInsuranceCompany { get; }

        public CreateInsuranceCompanyCommand(CreateInsuranceCompanyViewModel newInsuranceCompany) : base(Guid.NewGuid())
        {
            NewInsuranceCompany = newInsuranceCompany;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
