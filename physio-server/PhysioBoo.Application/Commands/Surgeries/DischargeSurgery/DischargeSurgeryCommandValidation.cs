using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.DischargeSurgery
{
    public sealed class DischargeSurgeryCommandValidation : AbstractValidator<DischargeSurgeryCommand>
    {
        public DischargeSurgeryCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");
        }
    }
}
