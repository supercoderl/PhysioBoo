using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.ForgotPassword
{
    public sealed class ForgotPasswordCommandValidation : AbstractValidator<ForgotPasswordCommand>
    {
        public ForgotPasswordCommandValidation()
        {
            RuleForEmail();
        }

        private void RuleForEmail()
        {
            RuleFor(cmd => cmd.Email).NotEmpty().WithErrorCode("FORGOT_PASSWORD_EMPTY_EMAIL").WithMessage("Email may not be empty.");
        }
    }
}
