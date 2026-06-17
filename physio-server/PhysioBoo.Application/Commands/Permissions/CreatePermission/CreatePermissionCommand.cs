using MediatR;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Permissions.CreatePermission
{
    public sealed class CreatePermissionCommand : CommandBase, IRequest
    {
        private static readonly CreatePermissionCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreatePermissionViewModel NewPermission { get; }

        public CreatePermissionCommand(Guid newId, CreatePermissionViewModel newPermission) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewPermission = newPermission;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
