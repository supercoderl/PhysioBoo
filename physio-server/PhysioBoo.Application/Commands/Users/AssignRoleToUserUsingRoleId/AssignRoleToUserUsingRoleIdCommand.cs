using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.AssignRoleToUserUsingRoleId
{
    public sealed class AssignRoleToUserUsingRoleIdCommand : CommandBase, IRequest
    {
        private static readonly AssignRoleToUserUsingRoleIdCommandValidation s_validation = new();

        public Guid RoleId { get; }
        public Guid UserId { get; }

        public AssignRoleToUserUsingRoleIdCommand(Guid userId, Guid roleId) : base(Guid.NewGuid())
        {
            UserId = userId;
            RoleId = roleId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
