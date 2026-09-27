using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.UpdateUser
{
    public sealed class UpdateUserCommandValidation : AbstractValidator<UpdateUserCommand>
    {
        public UpdateUserCommandValidation()
        {
            RuleForId();
            RuleForEmail();
            RuleForPhone();
            RuleForAlternatePhone();
            RuleForPreferredLanguage();
            RuleForTimeZone();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForEmail()
        {
            RuleFor(cmd => cmd.UpdateUserData.Email)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyEmail)
                .WithMessage("Email may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.User.EmailExceedsMaxLength)
                .WithMessage("Email may not be longer than 255 characters.")
                .EmailAddress()
                .WithErrorCode(DomainErrorCodes.User.InvalidEmail)
                .WithMessage("Email is not a valid email address.");
        }

        public void RuleForPhone()
        {
            RuleFor(cmd => cmd.UpdateUserData.Phone)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPhone)
                .WithMessage("Phone may not be empty.")
                .MaximumLength(20)
                .WithErrorCode(DomainErrorCodes.User.PhoneExceedsMaxLength)
                .WithMessage("Phone may not be longer than 20 characters.")
                .PhoneNumber()
                .WithErrorCode(DomainErrorCodes.User.InvalidPhone)
                .WithMessage("Phone is not a valid phone number.");
        }

        public void RuleForAlternatePhone()
        {
            RuleFor(cmd => cmd.UpdateUserData.AlternatePhone!)
                .MaximumLength(20)
                .WithErrorCode(DomainErrorCodes.User.PhoneExceedsMaxLength)
                .WithMessage("Alternate phone may not be longer than 20 characters.")
                .PhoneNumber()
                .WithErrorCode(DomainErrorCodes.User.InvalidAlternatePhone)
                .WithMessage("Alternate phone is not a valid phone number.")
                .When(cmd => !string.IsNullOrWhiteSpace(cmd.UpdateUserData.AlternatePhone));
        }

        public void RuleForPreferredLanguage()
        {
            RuleFor(cmd => cmd.UpdateUserData.PreferredLanguage)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPreferredLanguage)
                .WithMessage("Preferred language may not be empty.")
                .MaximumLength(10)
                .WithErrorCode(DomainErrorCodes.User.PreferredLanguageExceedsMaxLength)
                .WithMessage("Preferred language may not be longer than 10 characters.");
        }

        public void RuleForTimeZone()
        {
            RuleFor(cmd => cmd.UpdateUserData.TimeZone)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyTimeZone)
                .WithMessage("Time zone may not be empty.")
                .MaximumLength(50)
                .WithErrorCode(DomainErrorCodes.User.TimeZoneExceedsMaxLength)
                .WithMessage("Time zone may not be longer than 50 characters.");
        }
    }
}
