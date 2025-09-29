using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.DoctorEducations;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation
{
    public sealed class CreateDoctorEducationCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorEducationCommandValidation s_validation = new();

        public CreateDoctorEducationViewModel NewDoctorEducation { get; }

        public CreateDoctorEducationCommand(CreateDoctorEducationViewModel newDoctorEducation) : base(Guid.NewGuid())
        {
            NewDoctorEducation = newDoctorEducation;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}