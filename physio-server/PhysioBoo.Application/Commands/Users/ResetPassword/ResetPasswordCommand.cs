using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.ResetPassword
{
    public sealed class ResetPasswordCommand : CommandBase, IRequest
    {
        private static readonly ResetPasswordCommandValidation s_validation = new();

        public Guid Id { get; }
        public string Email { get; }
        public string NewPassword { get; }

        public ResetPasswordCommand(Guid id, string email, string newPassword) : base(Guid.NewGuid())
        {
            Id = id;
            NewPassword = newPassword;
            Email = email;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
