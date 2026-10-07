using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Invites.RevokeInvite
{
    public sealed class RevokeInviteCommandValidation : AbstractValidator<RevokeInviteCommand>
    {
        public RevokeInviteCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Id may not be empty.");
        }
    }
}
