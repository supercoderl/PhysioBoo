using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.DoctorWorkExperiences;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience
{
    public sealed class CreateDoctorWorkExperienceCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorWorkExperienceCommandValidation s_validation = new();

        public CreateDoctorWorkExperienceViewModel NewDoctorWorkExperience { get; }

        public CreateDoctorWorkExperienceCommand(CreateDoctorWorkExperienceViewModel newDoctorWorkExperience) : base(Guid.NewGuid())
        {
            NewDoctorWorkExperience = newDoctorWorkExperience;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}