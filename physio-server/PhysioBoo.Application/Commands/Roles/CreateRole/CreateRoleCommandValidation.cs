using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Roles.CreateRole
{
    public sealed class CreateRoleCommandValidation : AbstractValidator<CreateRoleCommand>
    {
        public CreateRoleCommandValidation()
        {
            RuleForName();
            RuleForCode();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewRole.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyName)
                .WithMessage("Name may not be empty.");
        }

        public void RuleForCode()
        {
            RuleFor(cmd => cmd.NewRole.Code)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyCode)
                .WithMessage("Code may not be empty.");
        }
    }
}
