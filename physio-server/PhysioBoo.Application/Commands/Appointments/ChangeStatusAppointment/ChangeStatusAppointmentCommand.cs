using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Appointments.ChangeStatusAppointment
{
    public sealed class ChangeStatusAppointmentCommand : CommandBase, IRequest
    {
        private static readonly ChangeStatusAppointmentCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateAppointmentStatusViewModel Appointment { get; }

        public ChangeStatusAppointmentCommand(
            Guid id,
            UpdateAppointmentStatusViewModel appointment
        ) : base(Guid.NewGuid())
        {
            Id = id;
            Appointment = appointment;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
