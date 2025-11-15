using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Permissions.CreatePermission
{
    public sealed class CreatePermissionCommandValidation : AbstractValidator<CreatePermissionCommand>
    {
        public CreatePermissionCommandValidation()
        {
            RuleForName();
            RuleForCode();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewPermission.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyName)
                .WithMessage("Name may not be empty.");
        }

        public void RuleForCode()
        {
            RuleFor(cmd => cmd.NewPermission.Code)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyCode)
                .WithMessage("Code may not be empty.");
        }
    }
}
