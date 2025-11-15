using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Roles.CreateRole
{
    public sealed class CreateRoleCommand : CommandBase, IRequest
    {
        private static readonly CreateRoleCommandValidation s_validation = new();

        public CreateRoleViewModel NewRole { get; }
        public Guid UserId { get; }

        public CreateRoleCommand(CreateRoleViewModel newRole, Guid userId) : base(Guid.NewGuid())
        {
            NewRole = newRole;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
