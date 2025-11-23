using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.AssignRoleToUser
{
    public sealed class AssignRoleToUserCommand : CommandBase, IRequest
    {
        private static readonly AssignRoleToUserCommandValidation s_validation = new();

        public RoleForAssigningViewModel RoleForAssigning { get; }

        public AssignRoleToUserCommand(RoleForAssigningViewModel roleForAssigning) : base(Guid.NewGuid())
        {
            RoleForAssigning = roleForAssigning;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
