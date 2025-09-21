using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.RefreshToken
{
    public sealed class RefreshTokenCommandValidation : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidation()
        {
            RuleForToken();
        }

        private void RuleForToken()
        {
            RuleFor(cmd => cmd.RefreshToken).NotEmpty().WithErrorCode(DomainErrorCodes.RefreshToken.EmptyToken).WithMessage("Refresh token may not be empty.");
        }
    }
}
