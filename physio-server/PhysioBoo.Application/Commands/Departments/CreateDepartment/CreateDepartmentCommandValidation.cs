using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Departments.CreateDepartment
{
    public sealed class CreateDepartmentCommandValidation : AbstractValidator<CreateDepartmentCommand>
    {
        public CreateDepartmentCommandValidation()
        {
            RuleForHospitalId();
            RuleForName();
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewDepartment.HospitalId).NotEmpty().WithErrorCode(DomainErrorCodes.Department.EmptyHospitalId).WithMessage("Hospital id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewDepartment.Name).NotEmpty().WithErrorCode(DomainErrorCodes.Department.EmptyHospitalId).WithMessage("Name may not be empty.");
        }
    }
}
