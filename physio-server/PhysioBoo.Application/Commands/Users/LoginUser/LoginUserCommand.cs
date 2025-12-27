using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Users.LoginUser
{
    public sealed class LoginUserCommand : CommandBase, IRequest
    {
        private static readonly LoginUserCommandValidation s_validation = new();

        public string Email { get; }
        public string Password { get; }

        [JsonIgnore]
        public AuthResult? Result { get; set; }

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
