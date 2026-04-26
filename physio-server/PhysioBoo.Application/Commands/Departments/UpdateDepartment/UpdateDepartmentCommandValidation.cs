using FluentValidation;

namespace PhysioBoo.Application.Commands.Departments.UpdateDepartment
{
    public sealed class UpdateDepartmentCommandValidation : AbstractValidator<UpdateDepartmentCommand>
    {
        public UpdateDepartmentCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}