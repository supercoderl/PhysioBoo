using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.LogoutUser
{
    public sealed class LogoutUserCommandValidation : AbstractValidator<LogoutUserCommand>
    {
        public LogoutUserCommandValidation()
        {

        }
    }
}
