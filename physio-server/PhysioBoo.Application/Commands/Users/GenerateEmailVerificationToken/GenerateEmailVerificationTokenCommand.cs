using MediatR;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommand : CommandBase, IRequest
    {
        private static readonly GenerateEmailVerificationTokenCommandValidation s_validation = new();

        public CreateVerificationTokenViewModel NewVerificationToken { get; }

        public GenerateEmailVerificationTokenCommand(CreateVerificationTokenViewModel newVerificationToken) : base(newVerificationToken.Id)
        {
            NewVerificationToken = newVerificationToken;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
