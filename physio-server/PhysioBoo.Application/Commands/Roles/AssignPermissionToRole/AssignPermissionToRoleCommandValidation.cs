using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommandValidation : AbstractValidator<AssignPermissionToRoleCommand>
    {
        public AssignPermissionToRoleCommandValidation()
        {
            RuleForRoleId();
        }

        public void RuleForRoleId()
        {
            RuleFor(cmd => cmd.RoleId).NotEmpty().WithErrorCode(DomainErrorCodes.Role.EmptyId).WithMessage("Role id may not be empty.");
        }
    }
}
