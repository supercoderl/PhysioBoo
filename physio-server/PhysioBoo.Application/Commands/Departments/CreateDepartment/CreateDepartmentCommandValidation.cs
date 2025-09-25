using FluentValidation;

namespace PhysioBoo.Application.Commands.Departments.CreateDepartment
{
    public sealed class CreateDepartmentCommandValidation : AbstractValidator<CreateDepartmentCommand>
    {
        public CreateDepartmentCommandValidation()
        {

        }
    }
}
