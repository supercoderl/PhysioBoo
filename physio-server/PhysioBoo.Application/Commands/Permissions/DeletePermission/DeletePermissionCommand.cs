using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Permissions.DeletePermission
{
    public sealed class DeletePermissionCommand : CommandBase, IRequest
    {
        private static readonly DeletePermissionCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeletePermissionCommand(Guid id, bool isHard = false) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
