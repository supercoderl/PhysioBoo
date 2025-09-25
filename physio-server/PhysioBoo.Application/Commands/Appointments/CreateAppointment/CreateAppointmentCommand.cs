using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Appointments.CreateAppointment
{
    public sealed class CreateAppointmentCommand : CommandBase, IRequest
    {
        private static readonly CreateAppointmentCommandValidation s_validation = new();

        public CreateAppointmentViewModel NewAppointment { get; }
        public Guid? UserId { get; }

        public CreateAppointmentCommand(CreateAppointmentViewModel newAppointment, Guid? userId) : base(Guid.NewGuid())
        {
            NewAppointment = newAppointment;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
