using MediatR;
using PhysioBoo.Application.ViewModels.PatientAllergies;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy
{
    public sealed class CreatePatientAllergyCommand : CommandBase, IRequest
    {
        private static readonly CreatePatientAllergyCommandValidation s_validation = new();

        public CreatePatientAllergyViewModel NewPatientAllergy { get; }

        public CreatePatientAllergyCommand(CreatePatientAllergyViewModel newPatientAllergy) : base(Guid.NewGuid())
        {
            NewPatientAllergy = newPatientAllergy;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
