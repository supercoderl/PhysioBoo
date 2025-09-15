using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommandValidation : AbstractValidator<GenerateEmailVerificationTokenCommand>
    {
        public GenerateEmailVerificationTokenCommandValidation()
        {
            RuleForEmail();
        }

        public void RuleForEmail()
        {
            RuleFor(cmd => cmd.Email).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyEmail).WithMessage("Email may not be empty.");
        }
    }
}
