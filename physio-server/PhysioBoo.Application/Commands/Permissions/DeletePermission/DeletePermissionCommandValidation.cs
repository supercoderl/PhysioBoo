using FluentValidation;

namespace PhysioBoo.Application.Commands.Permissions.DeletePermission
{
    public sealed class DeletePermissionCommandValidation : AbstractValidator<DeletePermissionCommand>
    {
        public DeletePermissionCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}