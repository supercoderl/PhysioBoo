using MediatR;
using PhysioBoo.SharedKenel.Commands;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommand : CommandBase, IRequest
    {
        private static readonly GenerateEmailVerificationTokenCommandValidation s_validation = new();

        public string Email { get; }

        public GenerateEmailVerificationTokenCommand(
            string email
        ) : base(Guid.NewGuid())
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
