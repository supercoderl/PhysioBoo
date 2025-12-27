using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.ResetPassword
{
    public sealed class ResetPasswordCommand : CommandBase, IRequest
    {
        private static readonly ResetPasswordCommandValidation s_validation = new();

        public string Token { get; }
        public string NewPassword { get; }

        public ResetPasswordCommand(string token, string newPassword) : base(Guid.NewGuid())
        {
            NewPassword = newPassword;
            Token = token;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
