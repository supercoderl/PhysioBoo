using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.VerifyUser
{
    public sealed class VerifyUserCommand : CommandBase, IRequest
    {
        private static readonly VerifyUserCommandValidation s_validation = new();

        public string Token { get; }
        public string Type { get; }

        public VerifyUserCommand(string token, string type) : base(Guid.NewGuid())
        {
            Token = token;
            Type = type;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
