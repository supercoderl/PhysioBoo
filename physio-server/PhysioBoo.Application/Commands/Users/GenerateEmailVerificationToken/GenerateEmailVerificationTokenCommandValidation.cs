using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommandValidation : AbstractValidator<GenerateEmailVerificationTokenCommand>
    {
        public GenerateEmailVerificationTokenCommandValidation()
        {

        }
    }
}
