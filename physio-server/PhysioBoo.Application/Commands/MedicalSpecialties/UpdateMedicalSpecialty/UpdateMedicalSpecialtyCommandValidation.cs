using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.UpdateMedicalSpecialty
{
    public sealed class UpdateMedicalSpecialtyCommandValidation : AbstractValidator<UpdateMedicalSpecialtyCommand>
    {
        public UpdateMedicalSpecialtyCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForCodeAndCategory();
            RuleForConsultationDuration();
            RuleForParentSpecialtyId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalSpecialty.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.MedicalSpecialty.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalSpecialty.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(200)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 200 characters.");
        }

        public void RuleForCodeAndCategory()
        {
            RuleFor(cmd => cmd.MedicalSpecialty.Code).MaxLen(100, "Code");
            RuleFor(cmd => cmd.MedicalSpecialty.Category).MaxLen(100, "Category");
        }

        public void RuleForConsultationDuration()
        {
            RuleFor(cmd => cmd.MedicalSpecialty.AverageConsultationDuration)
                .NotNegative("Average consultation duration");
        }

        public void RuleForParentSpecialtyId()
        {
            RuleFor(cmd => cmd.MedicalSpecialty.ParentSpecialtyId)
                .NotEqual(cmd => (Guid?)cmd.Id)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("A specialty cannot be its own parent.");
        }
    }
}
