using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty
{
    public sealed class DeleteMedicalSpecialtyCommandValidation : AbstractValidator<DeleteMedicalSpecialtyCommand>
    {
        public DeleteMedicalSpecialtyCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalSpecialty.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
