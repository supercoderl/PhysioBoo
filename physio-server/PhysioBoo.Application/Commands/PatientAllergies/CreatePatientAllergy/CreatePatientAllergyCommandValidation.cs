using FluentValidation;

namespace PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy
{
    public sealed class CreatePatientAllergyCommandValidation : AbstractValidator<CreatePatientAllergyCommand>
    {
        public CreatePatientAllergyCommandValidation()
        {

        }
    }
}
