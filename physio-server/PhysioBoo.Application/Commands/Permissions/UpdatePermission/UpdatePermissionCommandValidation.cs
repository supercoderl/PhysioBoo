using FluentValidation;

namespace PhysioBoo.Application.Commands.Permissions.UpdatePermission
{
    public sealed class UpdatePermissionCommandValidation : AbstractValidator<UpdatePermissionCommand>
    {
        public UpdatePermissionCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}