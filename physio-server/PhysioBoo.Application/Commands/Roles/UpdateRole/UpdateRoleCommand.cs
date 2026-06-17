using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Roles.UpdateRole
{
    public sealed class UpdateRoleCommand : CommandBase, IRequest
    {
        private static readonly UpdateRoleCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateRoleViewModel Role { get; }

        public UpdateRoleCommand(Guid id, UpdateRoleViewModel role) : base(Guid.NewGuid())
        {
            Id = id;
            Role = role;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
