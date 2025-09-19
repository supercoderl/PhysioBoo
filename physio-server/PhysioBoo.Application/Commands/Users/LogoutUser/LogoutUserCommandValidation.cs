using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.LogoutUser
{
    public sealed class LogoutUserCommandValidation : AbstractValidator<LogoutUserCommand>
    {
        public LogoutUserCommandValidation()
        {
            RuleForRefreshToken();
        }

        private void RuleForRefreshToken()
        {
            RuleFor(cmd => cmd.RefreshToken).NotEmpty().WithErrorCode("LOGOUT_EMPTY_REFRESH_TOKEN").WithMessage("Refresh token may not be emtpy.");
        }
    }
}
