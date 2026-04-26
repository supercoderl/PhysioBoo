using FluentValidation;

namespace PhysioBoo.Application.Commands.Departments.DeleteDepartment
{
    public sealed class DeleteDepartmentCommandValidation : AbstractValidator<DeleteDepartmentCommand>
    {
        public DeleteDepartmentCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}