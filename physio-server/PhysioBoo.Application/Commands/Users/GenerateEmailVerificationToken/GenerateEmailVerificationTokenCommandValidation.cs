using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommandValidation : AbstractValidator<GenerateEmailVerificationTokenCommand>
    {
        public GenerateEmailVerificationTokenCommandValidation()
        {
            RuleForUserId();
            RuleForToken();
            RuleForExpiresAt();
            RuleForType();
        }

        public void RuleForUserId()
        {
            RuleFor(cmd => cmd.NewVerificationToken.UserId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyId)
                .WithMessage("UserId may not be empty.");
        }

        public void RuleForToken()
        {
            RuleFor(cmd => cmd.NewVerificationToken.Token)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.VerificationToken.EmptyToken)
                .WithMessage("Token may not be empty.");
        }

        public void RuleForExpiresAt()
        {
            RuleFor(cmd => cmd.NewVerificationToken.ExpiresAt)
                .GreaterThan(_ => DateTime.UtcNow)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("ExpiresAt must be in the future.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.NewVerificationToken.Type)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Type is invalid.");
        }
    }
}
