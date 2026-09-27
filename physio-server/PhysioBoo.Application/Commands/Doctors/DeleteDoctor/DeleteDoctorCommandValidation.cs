using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Doctors.DeleteDoctor
{
    public sealed class DeleteDoctorCommandValidation : AbstractValidator<DeleteDoctorCommand>
    {
        public DeleteDoctorCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Doctor.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
