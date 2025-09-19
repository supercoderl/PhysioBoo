using MediatR;
using PhysioBoo.Application.ViewModels.RefreshTokens;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken
{
    public sealed class CreateRefreshTokenCommand : CommandBase, IRequest
    {
        private static readonly CreateRefreshTokenCommandValidation s_validation = new();

        public List<CreateRefreshTokenViewModel> NewRefreshTokens { get; }

        public CreateRefreshTokenCommand(
            List<CreateRefreshTokenViewModel> newRefreshTokens
        ) : base(Guid.NewGuid())
        {
            NewRefreshTokens = newRefreshTokens;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
