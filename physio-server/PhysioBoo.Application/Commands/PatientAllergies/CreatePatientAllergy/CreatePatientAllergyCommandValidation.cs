using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy
{
    public sealed class CreatePatientAllergyCommandValidation : AbstractValidator<CreatePatientAllergyCommand>
    {
        public CreatePatientAllergyCommandValidation()
        {
            RuleForPatientId();
            RuleForAllergenName();
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewPatientAllergy.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PatientAllergy.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }

        public void RuleForAllergenName()
        {
            RuleFor(cmd => cmd.NewPatientAllergy.AllergenName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PatientAllergy.EmptyAllergenName)
                .WithMessage("AllergenName may not be empty.");
        }
    }
}
