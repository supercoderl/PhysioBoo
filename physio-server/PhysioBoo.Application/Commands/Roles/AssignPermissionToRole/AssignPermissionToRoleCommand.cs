using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommand : CommandBase, IRequest
    {
        private static readonly AssignPermissionToRoleCommandValidation s_validation = new();

        public PermissionForAssigningViewModel PermissionForAssigning { get; }
        public Guid UserId { get; }

        public AssignPermissionToRoleCommand(PermissionForAssigningViewModel permissionForAssigning) : base(Guid.NewGuid())
        {
            PermissionForAssigning = permissionForAssigning;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
