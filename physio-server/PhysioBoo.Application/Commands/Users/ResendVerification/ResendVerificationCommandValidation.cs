using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommandValidation : AbstractValidator<ResendVerificationCommand>
    {
        public ResendVerificationCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.UserId).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyId).WithMessage("User id may not be empty.");
        }
    }
}
