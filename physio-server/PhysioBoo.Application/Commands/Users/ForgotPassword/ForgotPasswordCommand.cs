using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.ForgotPassword
{
    public sealed class ForgotPasswordCommand : CommandBase, IRequest
    {
        private static readonly ForgotPasswordCommandValidation s_validation = new();

        public string Email { get; }

        public ForgotPasswordCommand(string email) : base(Guid.NewGuid())
        {
            Email = email;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
