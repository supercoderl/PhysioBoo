using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabOrders.CreateLabOrder
{
    public sealed class CreateLabOrderCommandValidation : AbstractValidator<CreateLabOrderCommand>
    {
        public CreateLabOrderCommandValidation()
        {
            RuleForOrderNumber();
            RuleForPatientId();
            RuleForDoctorId();
            RuleForAppointmentId();
            RuleForHospitalId();
        }

        public void RuleForOrderNumber()
        {
            RuleFor(cmd => cmd.NewLabOrder.OrderNumber)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrder.EmptyOrderNumber)
                .WithMessage("OrderNumber may not be empty.");
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewLabOrder.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrder.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewLabOrder.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrder.EmptyDoctorId)
                .WithMessage("DoctorId may not be empty.");
        }

        public void RuleForAppointmentId()
        {
            RuleFor(cmd => cmd.NewLabOrder.AppointmentId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrder.EmptyAppointmentId)
                .WithMessage("AppointmentId may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewLabOrder.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrder.EmptyHospitalId)
                .WithMessage("HospitalId may not be empty.");
        }
    }
}
