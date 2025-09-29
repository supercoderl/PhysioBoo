using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommandValidation : AbstractValidator<CreateAppointmentTypeCommand>
    {
        public CreateAppointmentTypeCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewAppointmentType.Name).NotEmpty().WithErrorCode(DomainErrorCodes.AppointmentType.EmptyName).WithMessage("Name may not be empty.");
        }
    }
}
