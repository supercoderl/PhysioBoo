using FluentValidation;

namespace PhysioBoo.Application.Commands.Appointments.CreateAppointment
{
    public sealed class CreateAppointmentCommandValidation : AbstractValidator<CreateAppointmentCommand>
    {
        public CreateAppointmentCommandValidation()
        {

        }
    }
}
