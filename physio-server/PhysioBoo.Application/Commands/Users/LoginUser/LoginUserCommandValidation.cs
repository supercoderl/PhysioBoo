using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.LoginUser
{
    public sealed class LoginUserCommandValidation : AbstractValidator<LoginUserCommand>
    {
        public LoginUserCommandValidation()
        {
            RuleForIdentifier();
            RuleForPassword();
        }

        public void RuleForIdentifier()
        {
            RuleFor(cmd => cmd.Identifier).NotEmpty().WithErrorCode("LOGIN_EMPTY_IDENTIFIER").WithMessage("Identifier may not be empty.");
        }

        public void RuleForPassword()
        {
            RuleFor(cmd => cmd.Password).NotEmpty().WithErrorCode("LOGIN_EMPTY_PASSWORD").WithMessage("Password may not be empty.");
        }
    }
}
