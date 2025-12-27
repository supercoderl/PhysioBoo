using FluentValidation;
using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.ResetPassword
{
    public sealed class ResetPasswordCommandValidation : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidation()
        {
            RuleForPassword();
            RuleForToken();
        }

        private void RuleForPassword()
        {
            RuleFor(cmd => cmd.NewPassword).Password();
        }

        private void RuleForToken()
        {
            RuleFor(cmd => cmd.Token).NotEmpty().WithErrorCode(DomainErrorCodes.VerificationToken.EmptyToken).WithMessage("Token may not be empty.");
        }
    }
}
