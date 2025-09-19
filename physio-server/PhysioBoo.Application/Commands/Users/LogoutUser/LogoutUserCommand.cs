using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.LogoutUser
{
    public sealed class LogoutUserCommand : CommandBase, IRequest
    {
        private static readonly LogoutUserCommandValidation s_validation = new();

        public string RefreshToken { get; }

        public LogoutUserCommand(string refreshToken) : base(Guid.NewGuid())
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
