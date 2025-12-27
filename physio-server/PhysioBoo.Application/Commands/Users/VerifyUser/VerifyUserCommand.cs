using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.VerifyUser
{
    public sealed class VerifyUserCommand : CommandBase, IRequest
    {
        private static readonly VerifyUserCommandValidation s_validation = new();

        public string Token { get; }
        public string Type { get; }
        public bool AllowModify { get; }

        public VerifyUserCommand(string token, string type, bool allowModify) : base(Guid.NewGuid())
        {
            Token = token;
            Type = type;
            AllowModify = allowModify;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
