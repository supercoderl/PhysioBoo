using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.VerifyUser
{
    public sealed class VerifyUserCommandValidation : AbstractValidator<VerifyUserCommand>
    {
        public VerifyUserCommandValidation()
        {
            RuleForToken();
        }

        private void RuleForToken()
        {
            RuleFor(cmd => cmd.Token).NotEmpty().WithErrorCode(DomainErrorCodes.VerificationToken.EmptyToken).WithMessage("Token may not be empty.");
        }
    }
}
