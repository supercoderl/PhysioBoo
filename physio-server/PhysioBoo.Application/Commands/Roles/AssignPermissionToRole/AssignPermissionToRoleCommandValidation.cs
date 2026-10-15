
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommandValidation : AbstractValidator<AssignPermissionToRoleCommand>
    {
        public AssignPermissionToRoleCommandValidation()
        {
            RuleForRoleId();
            RuleForPermissions();
        }

        public void RuleForPermissions()
        {
            RuleFor(cmd => cmd.PermissionForAssigning.Permissions)
                .NotNull()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Permissions may not be null.");
        }

        public void RuleForRoleId()
        {
            RuleFor(cmd => cmd.RoleId).NotEmpty().WithErrorCode(DomainErrorCodes.Role.EmptyId).WithMessage("Role id may not be empty.");
        }
    }
}
