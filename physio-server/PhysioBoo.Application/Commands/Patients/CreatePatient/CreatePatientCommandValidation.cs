using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Patients.CreatePatient
{
    public sealed class CreatePatientCommandValidation : AbstractValidator<CreatePatientCommand>
    {
        public CreatePatientCommandValidation()
        {
            RuleForPrimaryDoctorId();
        }

        public void RuleForPrimaryDoctorId()
        {
            RuleFor(cmd => cmd.NewPatient.PrimaryDoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Patient.EmptyPrimaryDoctorId)
                .WithMessage("PrimaryDoctorId may not be empty.");
        }
    }
}
