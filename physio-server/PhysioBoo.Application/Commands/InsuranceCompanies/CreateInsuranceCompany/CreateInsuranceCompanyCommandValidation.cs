using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandValidation : AbstractValidator<CreateInsuranceCompanyCommand>
    {
        public CreateInsuranceCompanyCommandValidation()
        {
            RuleForName();
            RuleForRequiredDocuments();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewInsuranceCompany.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.InsuranceCompany.EmptyName)
                .WithMessage("Name may not be empty.");
        }

        public void RuleForRequiredDocuments()
        {
            RuleFor(cmd => cmd.NewInsuranceCompany.RequiredDocuments)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.InsuranceCompany.EmptyRequiredDocuments)
                .WithMessage("RequiredDocuments may not be empty.");
        }
    }
}
