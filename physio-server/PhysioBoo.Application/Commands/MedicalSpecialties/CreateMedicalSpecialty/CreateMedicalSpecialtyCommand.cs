using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommand : CommandBase, IRequest
    {
        private static readonly CreateMedicalSpecialtyCommandValidation s_validation = new();

        public CreateMedicalSpecialtyViewModel NewMedicalSpecialty { get; }

        public CreateMedicalSpecialtyCommand(CreateMedicalSpecialtyViewModel newMedicalSpecialty) : base(Guid.NewGuid())
        {
            NewMedicalSpecialty = newMedicalSpecialty;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}