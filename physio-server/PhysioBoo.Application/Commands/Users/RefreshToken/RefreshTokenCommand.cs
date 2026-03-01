using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Users.RefreshToken
{
    public sealed class RefreshTokenCommand : CommandBase, IRequest
    {
        private static readonly RefreshTokenCommandValidation s_validation = new();

        public string RefreshToken { get; }

        [JsonIgnore]
        public AuthResult? Result { get; set; }

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
