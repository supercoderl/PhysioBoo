using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Roles.DeletePermissionFromRole
{
    public sealed class DeletePermissionFromRoleCommand : CommandBase, IRequest
    {
        private static readonly DeletePermissionFromRoleCommandValidation s_validation = new();

        public Guid RoleId { get; }
        public Guid PermissionId { get; }

        public DeletePermissionFromRoleCommand(Guid roleId, Guid permissionId) : base(roleId)
        {
            RoleId = roleId;
            PermissionId = permissionId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
