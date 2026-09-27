using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.DeleteInsuranceCompany
{
    public sealed class DeleteInsuranceCompanyCommandValidation : AbstractValidator<DeleteInsuranceCompanyCommand>
    {
        public DeleteInsuranceCompanyCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.InsuranceCompany.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
