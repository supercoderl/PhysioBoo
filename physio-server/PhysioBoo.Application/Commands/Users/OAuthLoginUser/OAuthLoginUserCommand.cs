using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Users.OAuthLoginUser
{
    public sealed class OAuthLoginUserCommand : CommandBase, IRequest
    {
        private static readonly OAuthLoginUserCommandValidation s_validation = new();

        public string Token { get; set; }
        public string Provider { get; set; }

        [JsonIgnore]
        public AuthResult? Result { get; set; }

        public OAuthLoginUserCommand(
            string token,
            string provider
        ) : base(Guid.NewGuid())
        {
            Token = token;
            Provider = provider;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
