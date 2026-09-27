using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommandValidation : AbstractValidator<ResendVerificationCommand>
    {
        public ResendVerificationCommandValidation()
        {
            RuleForVerificationType();
        }

        public void RuleForVerificationType()
        {
            RuleFor(cmd => cmd.VerificationType)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Verification type is invalid.");
        }
    }
}
