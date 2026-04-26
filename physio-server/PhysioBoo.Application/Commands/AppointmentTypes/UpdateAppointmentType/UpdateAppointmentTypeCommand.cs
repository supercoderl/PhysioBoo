using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AppointmentTypes.UpdateAppointmentType
{
    public sealed class UpdateAppointmentTypeCommand : CommandBase
    {
        private static readonly UpdateAppointmentTypeCommandValidation s_validation = new();

        public UpdateAppointmentTypeViewModel AppointmentType { get; }
        public Guid Id { get; }

        public UpdateAppointmentTypeCommand(UpdateAppointmentTypeViewModel appointmentType, Guid id) : base(Guid.NewGuid())
        {
            AppointmentType = appointmentType;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
