using FluentValidation;
using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.ChangePasswordUser
{
    public sealed class ChangePasswordUserCommandValidation : AbstractValidator<ChangePasswordUserCommand>
    {
        public ChangePasswordUserCommandValidation()
        {
            RuleForNewPassword();
            RuleForOldPassword();
            RuleForId();
        }

        private void RuleForOldPassword()
        {
            RuleFor(cmd => cmd.OldPassword).Password();
        }

        private void RuleForNewPassword()
        {
            RuleFor(cmd => cmd.NewPassword).Password();
        }

        private void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyId).WithMessage("User id may not be empty.");
        }
    }
}
