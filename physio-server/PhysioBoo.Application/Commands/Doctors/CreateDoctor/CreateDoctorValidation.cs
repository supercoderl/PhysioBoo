using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommandValidation : AbstractValidator<CreateDoctorCommand>
    {
        public CreateDoctorCommandValidation()
        {
            RuleForMedicalLicenseNumber();
        }

        public void RuleForMedicalLicenseNumber()
        {
            RuleFor(cmd => cmd.NewDoctor.MedicalLicenseNumber)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Doctor.EmptyMedicalLicenseNumber)
                .WithMessage("Medical license number may not be empty.");
        }
    }
}
