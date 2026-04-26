using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommandValidation : AbstractValidator<ResendVerificationCommand>
    {
        public ResendVerificationCommandValidation()
        {

        }
    }
}
