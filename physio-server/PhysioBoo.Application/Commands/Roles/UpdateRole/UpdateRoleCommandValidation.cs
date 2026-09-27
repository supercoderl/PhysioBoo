using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Roles.UpdateRole
{
    public sealed class UpdateRoleCommandValidation : AbstractValidator<UpdateRoleCommand>
    {
        public UpdateRoleCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForCode();
            RuleForAppearance();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.Role.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForCode()
        {
            RuleFor(cmd => cmd.Role.Code)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyCode)
                .WithMessage("Code may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Code may not be longer than 255 characters.");
        }

        public void RuleForAppearance()
        {
            RuleFor(cmd => cmd.Role.Color).MaxLen(255, "Color");
            RuleFor(cmd => cmd.Role.Icon).MaxLen(255, "Icon");
        }
    }
}
