using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany
{
    public sealed class UpdateInsuranceCompanyCommandValidation : AbstractValidator<UpdateInsuranceCompanyCommand>
    {
        public UpdateInsuranceCompanyCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForType();
            RuleForContact();
            RuleForCoverage();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.InsuranceCompany.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.InsuranceCompany.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.InsuranceCompany.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.InsuranceCompany.Type)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Type is invalid.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.InsuranceCompany.ContactPerson).MaxLen(255, "Contact person");
            RuleFor(cmd => cmd.InsuranceCompany.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.InsuranceCompany.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.InsuranceCompany.Website).MaxLen(255, "Website").OptionalUrl("Website");
        }

        public void RuleForCoverage()
        {
            RuleFor(cmd => cmd.InsuranceCompany.MaximumCoverageAmount).NotNegative("Maximum coverage amount");
            RuleFor(cmd => cmd.InsuranceCompany.ClaimSettlementRatio)
                .InclusiveBetween(0m, 100m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Claim settlement ratio must be between 0 and 100.");
            RuleFor(cmd => cmd.InsuranceCompany.AverageClaimSettlementTime).NotNegative("Average claim settlement time");
        }
    }
}
