using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.RefreshToken
{
    public sealed class RefreshTokenCommand : CommandBase, IRequest
    {
        private static readonly RefreshTokenCommandValidation s_validation = new();

        public string RefreshToken { get; }

        public RefreshTokenCommand(string refreshToken) : base(Guid.NewGuid())
        {
            RefreshToken = refreshToken;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
