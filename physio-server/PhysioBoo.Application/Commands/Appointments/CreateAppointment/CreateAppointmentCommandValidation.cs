using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Appointments.CreateAppointment
{
    public sealed class CreateAppointmentCommandValidation : AbstractValidator<CreateAppointmentCommand>
    {
        public CreateAppointmentCommandValidation()
        {
            RuleForPatientId();
            RuleForDoctorId();
            RuleForHospitalId();
            RuleForDepartmentId();
            RuleForAppointmentTypeId();
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewAppointment.PatientId).NotEmpty().WithErrorCode(DomainErrorCodes.Appointment.EmptyPatientId).WithMessage("Patient id may not be empty.");
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewAppointment.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.Appointment.EmptyDoctorId).WithMessage("Doctor id may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewAppointment.HospitalId).NotEmpty().WithErrorCode(DomainErrorCodes.Appointment.EmptyHospitalId).WithMessage("Hospital id may not be empty.");
        }

        public void RuleForDepartmentId()
        {
            RuleFor(cmd => cmd.NewAppointment.DepartmentId).NotEmpty().WithErrorCode(DomainErrorCodes.Appointment.EmptyDepartmentId).WithMessage("Department id may not be empty.");
        }

        public void RuleForAppointmentTypeId()
        {
            RuleFor(cmd => cmd.NewAppointment.AppointmentTypeId).NotEmpty().WithErrorCode(DomainErrorCodes.Appointment.EmptyAppointmentTypeId).WithMessage("Appointment type id may not be empty.");
        }
    }
}
