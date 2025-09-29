using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    public sealed class CreateBillCommandValidation : AbstractValidator<CreateBillCommand>
    {
        public CreateBillCommandValidation()
        {
            RuleForPatientId();
            RuleForAppointmentId();
            RuleForHospitalId();
            RuleForDepartmentId();
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewBill.PatientId).NotEmpty().WithErrorCode(DomainErrorCodes.Bill.EmptyPatientId).WithMessage("Patient id may not be empty.");
        }

        public void RuleForAppointmentId()
        {
            RuleFor(cmd => cmd.NewBill.AppointmentId).NotEmpty().WithErrorCode(DomainErrorCodes.Bill.EmptyAppointmentId).WithMessage("Appointment id may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewBill.HospitalId).NotEmpty().WithErrorCode(DomainErrorCodes.Bill.EmptyHospitalId).WithMessage("Hospital id may not be empty.");
        }

        public void RuleForDepartmentId()
        {
            RuleFor(cmd => cmd.NewBill.DepartmentId).NotEmpty().WithErrorCode(DomainErrorCodes.Bill.EmptyDepartmentId).WithMessage("Department id may not be empty.");
        }
    }
}
