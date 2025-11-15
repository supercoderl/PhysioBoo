using MediatR;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Permissions.CreatePermission
{
    public sealed class CreatePermissionCommand : CommandBase, IRequest
    {
        private static readonly CreatePermissionCommandValidation s_validation = new();

        public CreatePermissionViewModel NewPermission { get; }

        public CreatePermissionCommand(CreatePermissionViewModel newPermission) : base(Guid.NewGuid())
        {
            NewPermission = newPermission;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
