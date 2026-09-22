
using PhysioBoo.Application.ViewModels.Departments;


namespace PhysioBoo.Application.Commands.Departments.CreateDepartment
{
    public sealed class CreateDepartmentCommand : CommandBase, IRequest
    {
        private static readonly CreateDepartmentCommandValidation s_validation = new();

        public CreateDepartmentViewModel NewDepartment { get; }
        public Guid NewId { get; }

        public CreateDepartmentCommand(CreateDepartmentViewModel newDepartment, Guid newId) : base(Guid.NewGuid())
        {
            NewDepartment = newDepartment;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
