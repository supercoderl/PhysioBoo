using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommandValidation : AbstractValidator<CreateMedicalSpecialtyCommand>
    {
        public CreateMedicalSpecialtyCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewMedicalSpecialty.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalSpecialty.EmptyName)
                .WithMessage("Name may not be empty.");
        }
    }
}