using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommandValidation : AbstractValidator<CreateMedicalSpecialtyCommand>
    {
        public CreateMedicalSpecialtyCommandValidation()
        {
            RuleForName();
            RuleForCodeAndCategory();
            RuleForConsultationDuration();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewMedicalSpecialty.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalSpecialty.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(200)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 200 characters.");
        }

        public void RuleForCodeAndCategory()
        {
            RuleFor(cmd => cmd.NewMedicalSpecialty.Code).MaxLen(100, "Code");
            RuleFor(cmd => cmd.NewMedicalSpecialty.Category).MaxLen(100, "Category");
        }

        public void RuleForConsultationDuration()
        {
            RuleFor(cmd => cmd.NewMedicalSpecialty.AverageConsultationDuration)
                .NotNegative("Average consultation duration");
        }
    }
}
