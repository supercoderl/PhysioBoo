using FluentValidation;

namespace PhysioBoo.Application.Commands.Appointments.ChangeStatusAppointment
{
    public sealed class ChangeStatusAppointmentCommandValidation : AbstractValidator<ChangeStatusAppointmentCommand>
    {
        public ChangeStatusAppointmentCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}