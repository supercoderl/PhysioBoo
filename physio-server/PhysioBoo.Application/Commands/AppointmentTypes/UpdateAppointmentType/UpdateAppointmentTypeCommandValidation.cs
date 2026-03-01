using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.AppointmentTypes.UpdateAppointmentType
{
    public sealed class UpdateAppointmentTypeCommandValidation : AbstractValidator<UpdateAppointmentTypeCommand>
    {
        public UpdateAppointmentTypeCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.AppointmentType.Name).NotEmpty().WithErrorCode(DomainErrorCodes.AppointmentType.EmptyName).WithMessage("Name may not be empty.");
        }
    }
}
