using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.DoctorSpecialties;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty
{
    public sealed class CreateDoctorSpecialtyCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorSpecialtyCommandValidation s_validation = new();

        public CreateDoctorSpecialtyViewModel NewDoctorSpecialty { get; }

        public CreateDoctorSpecialtyCommand(CreateDoctorSpecialtyViewModel newDoctorSpecialty) : base(Guid.NewGuid())
        {
            NewDoctorSpecialty = newDoctorSpecialty;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}