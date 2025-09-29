using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule
{
    public sealed class CreateDoctorScheduleCommandValidation : AbstractValidator<CreateDoctorScheduleCommand>
    {
        public CreateDoctorScheduleCommandValidation()
        {
            RuleForDoctorId();
            RuleForHospitalId();
            RuleForDepartmentId();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorSchedule.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorSchedule.EmptyDoctorId)
                .WithMessage("Doctor Id may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewDoctorSchedule.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorSchedule.EmptyHospitalId)
                .WithMessage("Hospital Id may not be empty.");
        }

        public void RuleForDepartmentId()
        {
            RuleFor(cmd => cmd.NewDoctorSchedule.DepartmentId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorSchedule.EmptyDepartmentId)
                .WithMessage("Department Id may not be empty.");
        }
    }
}