using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience
{
    public sealed class CreateDoctorWorkExperienceCommandValidation : AbstractValidator<CreateDoctorWorkExperienceCommand>
    {
        public CreateDoctorWorkExperienceCommandValidation()
        {
            RuleForDoctorId();
            RuleForPositionTitle();
            RuleForOrganizationName();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorWorkExperience.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorWorkExperience.EmptyDoctorId)
                .WithMessage("Doctor Id may not be empty.");
        }

        public void RuleForPositionTitle()
        {
            RuleFor(cmd => cmd.NewDoctorWorkExperience.PositionTitle)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorWorkExperience.EmptyPositionTitle)
                .WithMessage("Position title may not be empty.");
        }

        public void RuleForOrganizationName()
        {
            RuleFor(cmd => cmd.NewDoctorWorkExperience.OrganizationName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorWorkExperience.EmptyOrganizationName)
                .WithMessage("Organization name may not be empty.");
        }
    }
}