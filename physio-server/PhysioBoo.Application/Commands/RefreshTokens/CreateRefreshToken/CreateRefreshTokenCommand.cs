using MediatR;
using PhysioBoo.Application.ViewModels.RefreshTokens;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken
{
    public sealed class CreateRefreshTokenCommand : CommandBase, IRequest
    {
        private static readonly CreateRefreshTokenCommandValidation s_validation = new();

        public CreateRefreshTokenViewModel NewRefreshToken { get; }

        public CreateRefreshTokenCommand(CreateRefreshTokenViewModel newRefreshToken) : base(newRefreshToken.Id)
        {
            NewRefreshToken = newRefreshToken;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
