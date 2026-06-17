using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.DeleteUser
{
    public sealed class DeleteUserCommandValidation : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}