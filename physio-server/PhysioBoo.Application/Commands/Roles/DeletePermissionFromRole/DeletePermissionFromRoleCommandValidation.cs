using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Roles.DeletePermissionFromRole
{
    public sealed class DeletePermissionFromRoleCommandValidation : AbstractValidator<DeletePermissionFromRoleCommand>
    {
        public DeletePermissionFromRoleCommandValidation()
        {
            RuleForRoleId();
            RuleForPermissionId();
        }

        public void RuleForRoleId()
        {
            RuleFor(cmd => cmd.RoleId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyId)
                .WithMessage("RoleId may not be empty.");
        }

        public void RuleForPermissionId()
        {
            RuleFor(cmd => cmd.PermissionId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyId)
                .WithMessage("PermissionId may not be empty.");
        }
    }
}
