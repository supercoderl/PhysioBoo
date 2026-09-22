using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalServices.ChangeMedicalServiceStatus
{
    public sealed class ChangeMedicalServiceStatusCommandValidation : AbstractValidator<ChangeMedicalServiceStatusCommand>
    {
        public ChangeMedicalServiceStatusCommandValidation()
        {
            RuleFor(c => c.Ids)
                .NotEmpty().WithErrorCode(DomainErrorCodes.MedicalService.EmptyIds).WithMessage("At least one id is required.");
        }
    }
}