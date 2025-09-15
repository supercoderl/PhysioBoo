using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKenel.Commands;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommand : CommandBase, IRequest
    {
        private static readonly GenerateEmailVerificationTokenCommandValidation s_validation = new();

        public List<VerificationTokenViewModel> NewListVerificationTokens { get; }

        public GenerateEmailVerificationTokenCommand(
            List<VerificationTokenViewModel> newListVerificationTokens
        ) : base(Guid.NewGuid())
        {
            NewListVerificationTokens = newListVerificationTokens;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
