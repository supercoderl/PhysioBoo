
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    public sealed class CreateBillCommandValidation : AbstractValidator<CreateBillCommand>
    {
        public CreateBillCommandValidation()
        {
            RuleForPatientId();
            RuleForHospitalId();
            RuleForDepartmentId();

            RuleFor(cmd => cmd.NewBill.AppointmentId)
                .NotEmpty()
                .WithMessage("Appointment id is required when Source is Appointment.")
                .When(cmd => cmd.NewBill.Source == Domain.Enums.BillSource.Appointment);
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewBill.PatientId).NotEmpty().WithErrorCode(DomainErrorCodes.Bill.EmptyPatientId).WithMessage("Patient id may not be empty.");
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
