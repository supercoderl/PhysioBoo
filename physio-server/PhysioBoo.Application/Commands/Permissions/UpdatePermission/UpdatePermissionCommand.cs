using MediatR;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Permissions.UpdatePermission
{
    public sealed class UpdatePermissionCommand : CommandBase, IRequest
    {
        private static readonly UpdatePermissionCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdatePermissionViewModel Permission { get; }

        public UpdatePermissionCommand(Guid id, UpdatePermissionViewModel permission) : base(Guid.NewGuid())
        {
            Id = id;
            Permission = permission;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
