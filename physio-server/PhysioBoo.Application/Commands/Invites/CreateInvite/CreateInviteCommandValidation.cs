using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Invites.CreateInvite
{
    public sealed class CreateInviteCommandValidation : AbstractValidator<CreateInviteCommand>
    {
        public CreateInviteCommandValidation()
        {
            RuleForNewId();
            RuleForIntendedRole();
            RuleForEmail();
        }

        public void RuleForNewId()
        {
            RuleFor(cmd => cmd.NewId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForIntendedRole()
        {
            RuleFor(cmd => cmd.NewInvitation.IntendedRole)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.User.InvalidRole)
                .WithMessage("Intended role is invalid.");
        }

        public void RuleForEmail()
        {
            RuleFor(cmd => cmd.NewInvitation.Email)
                .MaxLen(255, "Email")
                .OptionalEmail("Email");
        }
    }
}
