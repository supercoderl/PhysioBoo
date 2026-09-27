using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken
{
    public sealed class CreateRefreshTokenCommandValidation : AbstractValidator<CreateRefreshTokenCommand>
    {
        public CreateRefreshTokenCommandValidation()
        {
            RuleForUserId();
            RuleForToken();
            RuleForExpiresAt();
        }

        public void RuleForUserId()
        {
            RuleFor(cmd => cmd.NewRefreshToken.UserId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.RefreshToken.EmptyUserId)
                .WithMessage("UserId may not be empty.");
        }

        public void RuleForToken()
        {
            RuleFor(cmd => cmd.NewRefreshToken.Token)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.RefreshToken.EmptyToken)
                .WithMessage("Token may not be empty.");
        }

        public void RuleForExpiresAt()
        {
            RuleFor(cmd => cmd.NewRefreshToken.ExpiresAt)
                .GreaterThan(_ => DateTime.UtcNow)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("ExpiresAt must be in the future.");
        }
    }
}
