using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Appointments.CreateAppointment
{
    public sealed class CreateAppointmentCommand : CommandBase, IRequest
    {
        private static readonly CreateAppointmentCommandValidation s_validation = new();

        public CreateAppointmentViewModel NewAppointment { get; }
        public Guid NewId { get; }

        public CreateAppointmentCommand(CreateAppointmentViewModel newAppointment, Guid newId) : base(Guid.NewGuid())
        {
            NewAppointment = newAppointment;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
