using MediatR;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommand : CommandBase, IRequest
    {
        private static readonly CreateAppointmentTypeCommandValidation s_validation = new();

        public CreateAppointmentTypeViewModel NewAppointmentType { get; }
        public Guid NewId { get; }

        public CreateAppointmentTypeCommand(CreateAppointmentTypeViewModel newAppointmentType, Guid newId) : base(Guid.NewGuid())
        {
            NewAppointmentType = newAppointmentType;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
