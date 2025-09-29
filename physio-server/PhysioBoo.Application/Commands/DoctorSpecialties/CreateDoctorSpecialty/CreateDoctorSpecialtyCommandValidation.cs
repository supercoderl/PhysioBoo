using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty
{
    public sealed class CreateDoctorSpecialtyCommandValidation : AbstractValidator<CreateDoctorSpecialtyCommand>
    {
        public CreateDoctorSpecialtyCommandValidation()
        {
            RuleForDoctorId();
            RuleForSpecialtyId();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorSpecialty.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorSpecialty.EmptyDoctorId)
                .WithMessage("Doctor Id may not be empty.");
        }

        public void RuleForSpecialtyId()
        {
            RuleFor(cmd => cmd.NewDoctorSpecialty.SpecialtyId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorSpecialty.EmptySpecialtyId)
                .WithMessage("Specialty Id may not be empty.");
        }
    }
}