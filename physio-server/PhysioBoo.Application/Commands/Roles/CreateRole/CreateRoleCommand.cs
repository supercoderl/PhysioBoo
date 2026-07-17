using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Roles.CreateRole
{
    public sealed class CreateRoleCommand : CommandBase, IRequest
    {
        private static readonly CreateRoleCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateRoleViewModel NewRole { get; }

        public CreateRoleCommand(CreateRoleViewModel newRole, Guid newId) : base(Guid.NewGuid())
        {
            NewRole = newRole;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
