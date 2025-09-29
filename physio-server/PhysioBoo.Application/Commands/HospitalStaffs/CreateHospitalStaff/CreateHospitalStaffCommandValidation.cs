using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff
{
    public sealed class CreateHospitalStaffCommandValidation : AbstractValidator<CreateHospitalStaffCommand>
    {
        public CreateHospitalStaffCommandValidation()
        {
            RuleForEmployeeId();
            RuleForHospitalId();
            RuleForDepartmentId();
        }

        public void RuleForEmployeeId()
        {
            RuleFor(cmd => cmd.NewHospitalStaff.EmployeeId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalStaff.EmptyEmployeeId)
                .WithMessage("EmployeeId may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewHospitalStaff.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalStaff.EmptyHospitalId)
                .WithMessage("HospitalId may not be empty.");
        }

        public void RuleForDepartmentId()
        {
            RuleFor(cmd => cmd.NewHospitalStaff.DepartmentId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalStaff.EmptyDepartmentId)
                .WithMessage("DepartmentId may not be empty.");
        }
    }
}