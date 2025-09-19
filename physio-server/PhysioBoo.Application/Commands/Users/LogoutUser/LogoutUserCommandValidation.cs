using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.LogoutUser
{
    public sealed class LogoutUserCommandValidation : AbstractValidator<LogoutUserCommand>
    {
        public LogoutUserCommandValidation()
        {
            RuleForUserId();
        }

        private void RuleForUserId()
        {
            RuleFor(cmd => cmd.UserId).NotEmpty().WithErrorCode("LOGOUT_EMPTY_USER_ID").WithMessage("User id may not be emtpy.");
        }
    }
}
