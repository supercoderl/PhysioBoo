using MediatR;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Departments.CreateDepartment
{
    public sealed class CreateDepartmentCommand : CommandBase, IRequest
    {
        private static readonly CreateDepartmentCommandValidation s_validation = new();

        public CreateDepartmentViewModel NewDepartment { get; }

        public CreateDepartmentCommand(CreateDepartmentViewModel newDepartment) : base(Guid.NewGuid())
        {
            NewDepartment = newDepartment;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
