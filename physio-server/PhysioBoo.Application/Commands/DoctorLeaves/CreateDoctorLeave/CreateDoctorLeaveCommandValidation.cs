using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave
{
    public sealed class CreateDoctorLeaveCommandValidation : AbstractValidator<CreateDoctorLeaveCommand>
    {
        public CreateDoctorLeaveCommandValidation()
        {
            RuleForDoctorId();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorLeave.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorLeave.EmptyDoctorId)
                .WithMessage("Doctor Id may not be empty.");
        }
    }
}