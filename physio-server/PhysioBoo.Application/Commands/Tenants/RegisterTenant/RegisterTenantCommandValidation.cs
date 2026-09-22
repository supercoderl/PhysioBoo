using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Tenants.RegisterTenant
{
    public sealed class RegisterTenantCommandValidation : AbstractValidator<RegisterTenantCommand>
    {
        public RegisterTenantCommandValidation()
        {
            RuleForCompanyName();
            RuleForBranches();
            RuleForOwnerEmail();
            RuleForOwnerPhone();
            RuleForOwnerPassword();
        }

        public void RuleForCompanyName()
        {
            RuleFor(cmd => cmd.NewTenant.Company.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalGroup.EmptyName)
                .WithMessage("Company name may not be empty.");
        }

        public void RuleForBranches()
        {
            RuleFor(cmd => cmd.NewTenant.Branches)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyBranches)
                .WithMessage("At least one branch is required.");

            RuleForEach(cmd => cmd.NewTenant.Branches).ChildRules(branch =>
            {
                branch.RuleFor(b => b.Name)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Hospital.EmptyName)
                    .WithMessage("Branch name may not be empty.");

                branch.RuleFor(b => b.Address)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Hospital.EmptyAddress)
                    .WithMessage("Branch address may not be empty.");

                branch.RuleFor(b => b.City)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Hospital.EmptyCity)
                    .WithMessage("Branch city may not be empty.");

                branch.RuleFor(b => b.StateProvince)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Hospital.EmptyStateProvince)
                    .WithMessage("Branch state/province may not be empty.");

                branch.RuleFor(b => b.Country)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Hospital.EmptyCountry)
                    .WithMessage("Branch country may not be empty.");
            });
        }

        public void RuleForOwnerEmail()
        {
            RuleFor(cmd => cmd.NewTenant.Owner.Email)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyEmail)
                .WithMessage("Owner email may not be empty.")
                .EmailAddress()
                .WithErrorCode(DomainErrorCodes.User.InvalidEmail)
                .WithMessage("Owner email is not a valid email address.");
        }

        public void RuleForOwnerPhone()
        {
            RuleFor(cmd => cmd.NewTenant.Owner.Phone)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPhone)
                .WithMessage("Owner phone may not be empty.");
        }

        public void RuleForOwnerPassword()
        {
            RuleFor(cmd => cmd.NewTenant.Owner.Password)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPassword)
                .WithMessage("Owner password may not be empty.")
                .MinimumLength(6)
                .WithErrorCode(DomainErrorCodes.User.PasswordTooShort)
                .WithMessage("Owner password must be at least 6 characters.");
        }
    }
}