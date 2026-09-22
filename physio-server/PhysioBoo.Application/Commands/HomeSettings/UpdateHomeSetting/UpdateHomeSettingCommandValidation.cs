using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeSettings.UpdateHomeSetting
{
    public sealed class UpdateHomeSettingCommandValidation : AbstractValidator<UpdateHomeSettingCommand>
    {
        public UpdateHomeSettingCommandValidation()
        {
            RuleForHospitalName();
            RuleForTagLine();
            RuleForWelcomeMessage();
            RuleForContactPhone();
            RuleForContactEmail();
            RuleForAddress();
        }

        public void RuleForHospitalName()
        {
            RuleFor(cmd => cmd.HomeSetting.HospitalName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HomeSetting.EmptyHospitalName)
                .WithMessage("Hospital name may not be empty.")
                .MaximumLength(200)
                .WithErrorCode(DomainErrorCodes.HomeSetting.HospitalNameExceedsMaxLength)
                .WithMessage("Hospital name may not exceed 200 characters.");
        }

        public void RuleForTagLine()
        {
            RuleFor(cmd => cmd.HomeSetting.TagLine)
                .MaximumLength(500)
                .WithErrorCode(DomainErrorCodes.HomeSetting.TagLineExceedsMaxLength)
                .WithMessage("Tagline may not exceed 500 characters.");
        }

        public void RuleForWelcomeMessage()
        {
            RuleFor(cmd => cmd.HomeSetting.WelcomeMessage)
                .MaximumLength(1000)
                .WithErrorCode(DomainErrorCodes.HomeSetting.WelcomeMessageExceedsMaxLength)
                .WithMessage("Welcome message may not exceed 1000 characters.");
        }

        public void RuleForContactPhone()
        {
            RuleFor(cmd => cmd.HomeSetting.ContactPhone)
                .MaximumLength(20)
                .WithErrorCode(DomainErrorCodes.HomeSetting.ContactPhoneExceedsMaxLength)
                .WithMessage("Contact phone may not exceed 20 characters.");
        }

        public void RuleForContactEmail()
        {
            RuleFor(cmd => cmd.HomeSetting.ContactEmail)
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.HomeSetting.ContactEmailExceedsMaxLength)
                .WithMessage("Contact email may not exceed 100 characters.")
                .EmailAddress()
                .WithErrorCode(DomainErrorCodes.HomeSetting.InvalidContactEmail)
                .WithMessage("Contact email is not a valid email address.")
                .When(cmd => !string.IsNullOrEmpty(cmd.HomeSetting.ContactEmail));
        }

        public void RuleForAddress()
        {
            RuleFor(cmd => cmd.HomeSetting.Address)
                .MaximumLength(500)
                .WithErrorCode(DomainErrorCodes.HomeSetting.AddressExceedsMaxLength)
                .WithMessage("Address may not exceed 500 characters.");
        }
    }
}
