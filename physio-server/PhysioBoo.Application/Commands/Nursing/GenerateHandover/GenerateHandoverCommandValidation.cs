using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.GenerateHandover
{
    public sealed class GenerateHandoverCommandValidation : AbstractValidator<GenerateHandoverCommand>
    {
        public GenerateHandoverCommandValidation()
        {
            RuleFor(c => c.OutgoingShift)
                .IsInEnum().WithErrorCode(DomainErrorCodes.Nursing.InvalidShift).WithMessage("Shift is not valid.");
        }
    }
}
