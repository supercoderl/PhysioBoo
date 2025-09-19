using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.LoginUser
{
    public sealed class LoginUserCommandValidation : AbstractValidator<LoginUserCommand>
    {
        public LoginUserCommandValidation()
        {
            RuleForEmail();
            RuleForPassword();
        }

        public void RuleForEmail()
        {
            RuleFor(cmd => cmd.Email).NotEmpty().WithErrorCode("LOGIN_EMPTY_EMAIL").WithMessage("Email may not be empty.");
        }

        public void RuleForPassword()
        {
            RuleFor(cmd => cmd.Password).NotEmpty().WithErrorCode("LOGIN_EMPTY_PASSWORD").WithMessage("Password may not be empty.");
        }
    }
}
