using MediatR;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommand : CommandBase, IRequest
    {
        private static readonly CreateAppointmentTypeCommandValidation s_validation = new();

        public CreateAppointmentTypeViewModel NewAppointmentType { get; }

        public CreateAppointmentTypeCommand(CreateAppointmentTypeViewModel newAppointmentType) : base(Guid.NewGuid())
        {
            NewAppointmentType = newAppointmentType;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
