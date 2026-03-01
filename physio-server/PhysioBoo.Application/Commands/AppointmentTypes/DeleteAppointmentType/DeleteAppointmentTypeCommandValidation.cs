using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.AppointmentTypes.DeleteAppointmentType
{
    public sealed class DeleteAppointmentTypeCommandValidation : AbstractValidator<DeleteAppointmentTypeCommand>
    {
        public DeleteAppointmentTypeCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.AppointmentType.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
