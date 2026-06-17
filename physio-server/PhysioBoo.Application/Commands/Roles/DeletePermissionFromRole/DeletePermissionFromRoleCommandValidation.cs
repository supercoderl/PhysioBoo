using FluentValidation;

namespace PhysioBoo.Application.Commands.Roles.DeletePermissionFromRole
{
    public sealed class DeletePermissionFromRoleCommandValidation : AbstractValidator<DeletePermissionFromRoleCommand>
    {
        public DeletePermissionFromRoleCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}