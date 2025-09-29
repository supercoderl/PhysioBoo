using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder
{
    public sealed class CreateImagingOrderCommandValidation : AbstractValidator<CreateImagingOrderCommand>
    {
        public CreateImagingOrderCommandValidation()
        {
            RuleForPatientId();
            RuleForDoctorId();
            RuleForAppointmentId();
            RuleForHospitalId();
            RuleForModalityId();
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewImagingOrder.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingOrder.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewImagingOrder.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingOrder.EmptyDoctorId)
                .WithMessage("DoctorId may not be empty.");
        }

        public void RuleForAppointmentId()
        {
            RuleFor(cmd => cmd.NewImagingOrder.AppointmentId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingOrder.EmptyAppointmentId)
                .WithMessage("AppointmentId may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewImagingOrder.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingOrder.EmptyHospitalId)
                .WithMessage("HospitalId may not be empty.");
        }

        public void RuleForModalityId()
        {
            RuleFor(cmd => cmd.NewImagingOrder.ModalityId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingOrder.EmptyModalityId)
                .WithMessage("ModalityId may not be empty.");
        }
    }
}
