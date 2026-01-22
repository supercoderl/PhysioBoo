using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.OAuthLoginUser
{
    public sealed class OAuthLoginUserCommandValidation : AbstractValidator<OAuthLoginUserCommand>
    {
        public OAuthLoginUserCommandValidation()
        {
            RuleForProvider();
        }

        public void RuleForProvider()
        {
            RuleFor(cmd => cmd.Provider).NotEmpty().WithErrorCode(DomainErrorCodes.UserLogin.EmptyLoginProvider).WithMessage("Login provider may not be empty.");
        }
    }
}
