using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Appointments.ChangeStatusAppointment
{
    public sealed class ChangeStatusAppointmentCommandValidation : AbstractValidator<ChangeStatusAppointmentCommand>
    {
        public ChangeStatusAppointmentCommandValidation()
        {
            RuleForId();
            RuleForStatus();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForStatus()
        {
            RuleFor(cmd => cmd.Appointment.Status)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Status is invalid.");
        }
    }
}
