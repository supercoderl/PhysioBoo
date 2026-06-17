using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Roles.DeleteRole
{
    public sealed class DeleteRoleCommand : CommandBase, IRequest
    {
        private static readonly DeleteRoleCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteRoleCommand(Guid id, bool isHard = false) : base(Guid.NewGuid())
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
