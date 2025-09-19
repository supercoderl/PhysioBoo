using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.LoginUser
{
    public sealed class LoginUserCommand : CommandBase, IRequest
    {
        private static readonly LoginUserCommandValidation s_validation = new();

        public string Email { get; }
        public string Password { get; }

        public LoginUserCommand(
           string email,
           string password
        ) : base(Guid.NewGuid())
        {
            Email = email;
            Password = password;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
