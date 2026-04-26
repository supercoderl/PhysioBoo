using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Departments.UpdateDepartment
{
    public sealed class UpdateDepartmentCommand : CommandBase
    {
        private static readonly UpdateDepartmentCommandValidation s_validation = new();

        public UpdateDepartmentViewModel Department { get; }
        public Guid NewId { get; }

        public UpdateDepartmentCommand(UpdateDepartmentViewModel department, Guid newId) : base(Guid.NewGuid())
        {
            Department = department;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
