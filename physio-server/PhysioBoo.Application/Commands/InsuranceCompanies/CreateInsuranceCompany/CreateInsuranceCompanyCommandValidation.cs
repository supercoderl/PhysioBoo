using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandValidation : AbstractValidator<CreateInsuranceCompanyCommand>
    {
        public CreateInsuranceCompanyCommandValidation()
        {
            RuleForName();
            RuleForType();
            RuleForContact();
            RuleForCoverage();
            RuleForRequiredDocuments();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewInsuranceCompany.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.InsuranceCompany.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.NewInsuranceCompany.Type)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Type is invalid.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.NewInsuranceCompany.ContactPerson).MaxLen(255, "Contact person");
            RuleFor(cmd => cmd.NewInsuranceCompany.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.NewInsuranceCompany.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.NewInsuranceCompany.Website).MaxLen(255, "Website").OptionalUrl("Website");
        }

        public void RuleForCoverage()
        {
            RuleFor(cmd => cmd.NewInsuranceCompany.MaximumCoverageAmount).NotNegative("Maximum coverage amount");
            RuleFor(cmd => cmd.NewInsuranceCompany.ClaimSettlementRatio)
                .InclusiveBetween(0m, 100m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Claim settlement ratio must be between 0 and 100.");
            RuleFor(cmd => cmd.NewInsuranceCompany.AverageClaimSettlementTime).NotNegative("Average claim settlement time");
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
