using FluentValidation;
using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.ResetPassword
{
    public sealed class ResetPasswordCommandValidation : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidation()
        {
            RuleForId();
            RuleForPassword();
            RuleForEmail();
        }

        private void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyId).WithMessage("User id may not be empty.");
        }

        private void RuleForPassword()
        {
            RuleFor(cmd => cmd.NewPassword).Password();
        }

        private void RuleForEmail()
        {
            RuleFor(cmd => cmd.Email).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyEmail).WithMessage("Email may not be empty.");
        }
    }
}
