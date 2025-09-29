using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation
{
    public sealed class CreateDoctorEducationCommandValidation : AbstractValidator<CreateDoctorEducationCommand>
    {
        public CreateDoctorEducationCommandValidation()
        {
            RuleForDoctorId();
            RuleForDegreeType();
            RuleForDegreeName();
            RuleForInstitutionName();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorEducation.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorEducation.EmptyDoctorId).WithMessage("Doctor id may not be empty.");
        }

        public void RuleForDegreeType()
        {
            RuleFor(cmd => cmd.NewDoctorEducation.DegreeType).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorEducation.EmptyDegreeType).WithMessage("Degree type may not be empty.");
        }

        public void RuleForDegreeName()
        {
            RuleFor(cmd => cmd.NewDoctorEducation.DegreeName).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorEducation.EmptyDegreeName).WithMessage("Degree name may not be empty.");
        }

        public void RuleForInstitutionName()
        {
            RuleFor(cmd => cmd.NewDoctorEducation.InstitutionName).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorEducation.EmptyInstitutionName).WithMessage("Institution name may not be empty.");
        }
    }
}